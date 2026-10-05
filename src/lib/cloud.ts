/**
 * Cloud care-team service (Supabase).
 *
 * MedSafe stays local-first: nothing in the core app requires this module.
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are present it adds the
 * doctor/patient layer - accounts, doctor directory, care links, messaging,
 * clinical notes and shared medication snapshots.
 *
 * Security: permissions live in the database (row-level security in
 * supabase/schema.sql), never in this file. The client only ever asks for
 * what the signed-in user is allowed to see - the database refuses the rest.
 */
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { CloudProfile, CareLink, CloudMessage, ClinicalNote, MedSnapshot } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isCloudEnabled = (): boolean => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Lazily load the Supabase client - the library only ships to devices that
 * actually call a cloud function, keeping the offline bundle small.
 */
function db(): Promise<SupabaseClient> {
  if (!isCloudEnabled()) {
    return Promise.reject(
      new Error('Cloud features are not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.')
    );
  }
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(mod =>
      mod.createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
    );
  }
  return clientPromise;
}

/** Unwrap a Supabase result or throw a readable error. */
function must<T>(res: { data: T | null; error: { message: string } | null }, fallback: string): T {
  if (res.error) throw new Error(res.error.message || fallback);
  if (res.data === null || res.data === undefined) throw new Error(fallback);
  return res.data;
}

/** Turn raw network/SDK errors into something a patient can act on. */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || '');
  if (/failed to fetch|networkerror|load resource/i.test(msg)) {
    return 'Could not reach the care-team service - check your internet connection, and that the Supabase keys in .env are correct.';
  }
  return msg || 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------- auth

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: { role: 'patient' | 'doctor'; fullName: string; specialty?: string; licenseNo?: string }
): Promise<string> {
  const { data, error } = await (await db()).auth.signUp({ email, password });
  if (error) {
    const friendly = /already (registered|exists)/i.test(error.message)
      ? 'An account with this email already exists - switch to “Sign in”.'
      : error.message;
    throw new Error(friendly);
  }
  const user = data.user;
  if (!user) throw new Error('Could not create the account.');
  if (!data.session) {
    // Without a session, row-level security blocks the profile insert.
    // Setup docs say to disable email confirmation for this project.
    throw new Error(
      'Account created but email confirmation is enabled. In Supabase: Authentication → Providers → Email → turn off “Confirm email”, then sign in.'
    );
  }
  must(
    await (await db())
      .from('profiles')
      .insert({
        id: user.id,
        role: profile.role,
        full_name: profile.fullName,
        specialty: profile.specialty || null,
        license_no: profile.licenseNo || null
      })
      .select(),
    'Account created but the profile could not be saved.'
  );
  return user.id;
}

export async function signInWithEmail(email: string, password: string): Promise<string> {
  const { data, error } = await (await db()).auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Sign-in failed.');
  return data.user.id;
}

export async function signOut(): Promise<void> {
  if (!isCloudEnabled()) return;
  const { error } = await (await db()).auth.signOut();
  if (error) throw new Error(error.message);
}

export async function fetchProfile(userId: string): Promise<CloudProfile | null> {
  const res = await (await db())
    .from('profiles')
    .select('id, role, full_name, specialty, license_no, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (res.error) throw new Error(res.error.message);
  if (!res.data) return null;
  return {
    id: res.data.id,
    role: res.data.role as CloudProfile['role'],
    fullName: res.data.full_name,
    specialty: res.data.specialty ?? undefined,
    licenseNo: res.data.license_no ?? undefined,
    createdAt: res.data.created_at
  };
}

/** Subscribe to auth changes; returns an unsubscribe function. */
export async function subscribeAuth(cb: (session: Session | null) => void): Promise<() => void> {
  const { data } = await (await db()).auth.onAuthStateChange((_event, session) => {
    // Deferred: supabase-js must not run other queries inside the callback
    // itself (it holds an internal auth lock while it runs).
    setTimeout(() => cb(session), 0);
  });
  return () => data.subscription.unsubscribe();
}

export async function currentSession(): Promise<Session | null> {
  const { data } = await (await db()).auth.getSession();
  return data.session;
}

// --------------------------------------------------- doctor directory

export async function listDoctors(): Promise<CloudProfile[]> {
  const rows = must(
    await (await db()).from('profiles').select('id, role, full_name, specialty, license_no, created_at').eq('role', 'doctor').order('full_name'),
    'Could not load the doctor directory.'
  );
  return rows.map(r => ({
    id: r.id,
    role: 'doctor',
    fullName: r.full_name,
    specialty: r.specialty ?? undefined,
    licenseNo: r.license_no ?? undefined,
    createdAt: r.created_at
  }));
}

// ------------------------------------------------------- care links

export async function requestCareLink(doctorId: string): Promise<void> {
  const { data } = await (await db()).auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('Sign in first.');
  must(
    await (await db())
      .from('care_links')
      .upsert(
        { patient_id: uid, doctor_id: doctorId, status: 'pending' },
        { onConflict: 'patient_id,doctor_id', ignoreDuplicates: true }
      )
      .select(),
    'Could not send the request.'
  );
}

type LinkRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: CareLink['status'];
  created_at: string;
  patient: { full_name: string } | null;
  doctor: { full_name: string; specialty: string | null } | null;
};

function toLink(r: LinkRow): CareLink {
  return {
    id: r.id,
    patientId: r.patient_id,
    doctorId: r.doctor_id,
    status: r.status,
    createdAt: r.created_at,
    patientName: r.patient?.full_name,
    doctorName: r.doctor?.full_name,
    doctorSpecialty: r.doctor?.specialty ?? undefined
  };
}

const LINK_SELECT =
  'id, patient_id, doctor_id, status, created_at, patient:profiles!care_links_patient_id_fkey(full_name), doctor:profiles!care_links_doctor_id_fkey(full_name, specialty)';

export async function fetchPatientLinks(patientId: string): Promise<CareLink[]> {
  const rows = must(
    await (await db()).from('care_links').select(LINK_SELECT).eq('patient_id', patientId).order('created_at', { ascending: false }),
    'Could not load your care links.'
  );
  return (rows as unknown as LinkRow[]).map(toLink);
}

export async function fetchDoctorLinks(doctorId: string): Promise<CareLink[]> {
  const rows = must(
    await (await db()).from('care_links').select(LINK_SELECT).eq('doctor_id', doctorId).order('created_at', { ascending: false }),
    'Could not load your patients.'
  );
  return (rows as unknown as LinkRow[]).map(toLink);
}

export async function respondToCareLink(linkId: string, status: 'active' | 'declined'): Promise<void> {
  must(
    await (await db()).from('care_links').update({ status }).eq('id', linkId).select(),
    'Could not update the request.'
  );
}

export async function cancelCareLink(linkId: string): Promise<void> {
  must(await (await db()).from('care_links').delete().eq('id', linkId), 'Could not remove the request.');
}

// -------------------------------------------------------- messaging

export async function fetchMessages(linkId: string): Promise<CloudMessage[]> {
  const rows = must(
    await (await db()).from('messages').select('id, link_id, sender_id, body, created_at').eq('link_id', linkId).order('created_at'),
    'Could not load messages.'
  );
  return (rows as { id: string; link_id: string; sender_id: string; body: string; created_at: string }[]).map(m => ({
    id: m.id,
    linkId: m.link_id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at
  }));
}

export async function sendMessage(linkId: string, senderId: string, body: string): Promise<void> {
  const text = body.trim();
  if (!text) return;
  must(
    await (await db()).from('messages').insert({ link_id: linkId, sender_id: senderId, body: text.slice(0, 4000) }).select(),
    'Message could not be sent.'
  );
}

// --------------------------------------------------- clinical notes

export async function fetchNotes(patientId: string): Promise<ClinicalNote[]> {
  const rows = must(
    await (await db())
      .from('clinical_notes')
      .select('id, link_id, doctor_id, patient_id, note, created_at, doctor:profiles!clinical_notes_doctor_id_fkey(full_name)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
    'Could not load notes.'
  );
  return (
    rows as unknown as {
      id: string;
      link_id: string;
      doctor_id: string;
      patient_id: string;
      note: string;
      created_at: string;
      doctor: { full_name: string } | null;
    }[]
  ).map(n => ({
    id: n.id,
    linkId: n.link_id,
    doctorId: n.doctor_id,
    patientId: n.patient_id,
    note: n.note,
    createdAt: n.created_at,
    doctorName: n.doctor?.full_name
  }));
}

export async function addNote(linkId: string, doctorId: string, patientId: string, note: string): Promise<void> {
  const text = note.trim();
  if (!text) throw new Error('Write a note first.');
  must(
    await (await db())
      .from('clinical_notes')
      .insert({ link_id: linkId, doctor_id: doctorId, patient_id: patientId, note: text.slice(0, 8000) })
      .select(),
    'Could not save the note.'
  );
}

// ------------------------------------------------ med list snapshot

export async function pushSnapshot(patientId: string, payload: MedSnapshot): Promise<void> {
  must(
    await (await db())
      .from('med_snapshots')
      .upsert({ patient_id: patientId, payload, updated_at: new Date().toISOString() }, { onConflict: 'patient_id' })
      .select(),
    'Could not share the medication list.'
  );
}

export async function fetchSnapshot(patientId: string): Promise<MedSnapshot | null> {
  const res = await (await db()).from('med_snapshots').select('payload, updated_at').eq('patient_id', patientId).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  if (!res.data) return null;
  const snap = res.data.payload as MedSnapshot;
  return { ...snap, updatedAt: res.data.updated_at };
}
