import React, { useCallback, useEffect, useState } from 'react';
import {
  Stethoscope,
  Search,
  UserPlus,
  MessageSquare,
  FileText,
  Share2,
  ArrowLeft,
  Check,
  Clock,
  X,
  RefreshCw,
  Users
} from 'lucide-react';
import type { Patient, Medication, Allergy, CloudProfile, CareLink, CloudMessage, ClinicalNote, MedSnapshot } from '../types';
import {
  listDoctors,
  requestCareLink,
  fetchPatientLinks,
  cancelCareLink,
  fetchMessages,
  sendMessage,
  markThreadRead,
  fetchNotes,
  pushSnapshot,
  friendlyError
} from '../lib/cloud';
import { useMessageSync } from '../hooks/useMessageSync';
import { toLocalDateStr } from '../services/ruleEngine';

interface CareTeamViewProps {
  patient: Patient;
  medications: Medication[];
  allergies: Allergy[];
  cloudProfile: CloudProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  /** Bubble notes up so they can appear on the printable medication sheet. */
  onNotesChanged: (notes: ClinicalNote[]) => void;
}

function buildSnapshot(patient: Patient, medications: Medication[], allergies: Allergy[]): MedSnapshot {
  const active = medications.filter(m => m.patientID === patient.patientID && m.status === 'active');
  const mine = allergies.filter(a => a.patientID === patient.patientID);
  return {
    patientName: patient.fullName,
    conditions: patient.conditionTags || [],
    allergies: mine.map(a => ({
      allergenName: a.allergenName,
      reactionSeverity: a.reactionSeverity,
      symptoms: a.symptoms
    })),
    medications: active.map(m => ({
      drugName: m.drugName,
      dosage: m.dosage,
      schedule: m.schedule,
      quantityPerDose: m.quantityPerDose,
      dosesPerDay: m.dosesPerDay,
      quantityRemaining: m.quantityRemaining,
      instructions: m.instructions,
      conditionCategory: m.conditionCategory
    })),
    generatedOn: toLocalDateStr()
  };
}

const StatusPill: React.FC<{ status: CareLink['status'] }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    declined: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    ended: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${map[status] || map.ended}`}>
      {status}
    </span>
  );
};

export const CareTeamView: React.FC<CareTeamViewProps> = ({
  patient,
  medications,
  allergies,
  cloudProfile,
  onOpenAuth,
  onSignOut,
  onNotesChanged
}) => {
  const [doctors, setDoctors] = useState<CloudProfile[]>([]);
  const [links, setLinks] = useState<CareLink[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sharedOn, setSharedOn] = useState<string | null>(null);

  // Thread state
  const [threadLink, setThreadLink] = useState<CareLink | null>(null);
  const [messages, setMessages] = useState<CloudMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    if (!cloudProfile) return;
    setLoading(true);
    setError(null);
    try {
      const [docs, ls, ns] = await Promise.all([
        listDoctors(),
        fetchPatientLinks(cloudProfile.id),
        fetchNotes(cloudProfile.id)
      ]);
      setDoctors(docs);
      setLinks(ls);
      setNotes(ns);
      onNotesChanged(ns);
    } catch (err) {
      setError(friendlyError(err) || 'Could not load care team.');
    } finally {
      setLoading(false);
    }
  }, [cloudProfile, onNotesChanged]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the open thread live: realtime when the project has messages in the
  // realtime publication, otherwise useMessageSync falls back to 15s polling.
  const reloadThread = useCallback(async () => {
    if (!threadLink) return;
    try {
      const ms = await fetchMessages(threadLink.id);
      setMessages(ms);
      // Opening/refreshing a thread marks the other side's messages as read
      // (no-op with a single console warning until the patch SQL is run).
      markThreadRead(threadLink.id).catch(() => undefined);
    } catch {
      /* transient - retried on the next sync event */
    }
  }, [threadLink]);

  useEffect(() => {
    if (!threadLink) {
      setMessages([]);
      return;
    }
    void reloadThread();
  }, [reloadThread, threadLink]);

  useMessageSync(() => {
    void reloadThread();
  }, Boolean(threadLink));

  const handleRequest = async (doctorId: string) => {
    setError(null);
    try {
      await requestCareLink(doctorId);
      await refresh();
    } catch (err) {
      setError(friendlyError(err) || 'Could not send request.');
    }
  };

  const handleCancel = async (linkId: string) => {
    setError(null);
    try {
      await cancelCareLink(linkId);
      await refresh();
    } catch (err) {
      setError(friendlyError(err) || 'Could not cancel.');
    }
  };

  const handleShare = async () => {
    if (!cloudProfile) return;
    setError(null);
    try {
      await pushSnapshot(cloudProfile.id, buildSnapshot(patient, medications, allergies));
      setSharedOn(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError(friendlyError(err) || 'Could not share the list.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadLink || !cloudProfile || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(threadLink.id, cloudProfile.id, draft);
      setDraft('');
      setMessages(await fetchMessages(threadLink.id));
    } catch (err) {
      setError(friendlyError(err) || 'Message failed to send.');
    } finally {
      setSending(false);
    }
  };

  // ------------------------------------------------------ signed-out
  if (!cloudProfile) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3 text-center">
        <Users className="w-7 h-7 text-teal-600 dark:text-teal-400 mx-auto" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Your care team</h3>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mt-1">
            Connect to pick your doctor from the register, message them, receive their notes and share your medication
            list - from any device. Your local data stays on this phone; only the list you share is sent.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition active:scale-[0.99]"
        >
          Sign in / create account
        </button>
      </div>
    );
  }

  // ------------------------------------------------------ chat thread
  if (threadLink) {
    const other = threadLink.doctorName || 'Doctor';
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60">
          <button
            onClick={() => setThreadLink(null)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
            aria-label="Back to care team"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">{other}</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
              {threadLink.doctorSpecialty || 'Doctor'} · secure message
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2 max-h-[46vh] overflow-y-auto min-h-[140px]">
          {messages.length === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center py-6">
              No messages yet. Say hello or ask a question about your medication.
            </p>
          )}
          {messages.map(m => {
            const mineMsg = m.senderId === cloudProfile.id;
            return (
              <div key={m.id} className={`flex ${mineMsg ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-snug whitespace-pre-wrap break-words ${
                    mineMsg
                      ? 'bg-teal-700 text-white rounded-br-md'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-md'
                  }`}
                >
                  {m.body}
                  <div className={`text-[9px] mt-1 ${mineMsg ? 'text-teal-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                    {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t border-slate-200 dark:border-zinc-800">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="px-3.5 py-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {sending ? '…' : 'Send'}
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------- list
  const activeLinks = links.filter(l => l.status === 'active');
  const pendingLinks = links.filter(l => l.status === 'pending');
  const linkedDoctorIds = new Set(links.filter(l => l.status !== 'declined' && l.status !== 'ended').map(l => l.doctorId));
  const directory = doctors.filter(
    d =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty || '').toLowerCase().includes(search.toLowerCase())
  );
  const activeMeds = medications.filter(m => m.patientID === patient.patientID && m.status === 'active').length;

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-[11px] leading-snug">
          {error}
        </div>
      )}

      {/* Account bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-3 border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-bold truncate">{cloudProfile.fullName}</div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">Connected · care team enabled</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onSignOut}
            className="px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Share medication list */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Share2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Shared medication list</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
          {activeMeds} active medication{activeMeds === 1 ? '' : 's'} · allergies and conditions included. Your linked
          doctor can read-only view this list; nothing else leaves this device.
        </p>
        <button
          onClick={handleShare}
          className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition active:scale-[0.99]"
        >
          {sharedOn ? 'Shared again ✓' : 'Share list with my doctor'}
        </button>
        {sharedOn && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Updated at {sharedOn}
          </p>
        )}
      </div>

      {/* My doctors */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>My doctors</span>
        </div>

        {activeLinks.length === 0 && pendingLinks.length === 0 && (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            No doctor connected yet. Request one below and they can see your shared list once they approve.
          </p>
        )}

        {activeLinks.map(l => (
          <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {(l.doctorName || 'D').split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{l.doctorName}</div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{l.doctorSpecialty}</div>
            </div>
            <button
              onClick={() => setThreadLink(l)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold transition shrink-0"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Message</span>
            </button>
          </div>
        ))}

        {pendingLinks.map(l => (
          <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {(l.doctorName || 'D').split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{l.doctorName}</div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Request sent - awaiting approval
              </div>
            </div>
            <button
              onClick={() => handleCancel(l.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-zinc-800 transition shrink-0"
              aria-label="Cancel request"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Doctor's notes */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          <span>Notes from my doctor</span>
        </div>
        {notes.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">No notes yet.</p>
        ) : (
          <div className="space-y-2">
            {notes.map(n => (
              <div key={n.id} className="p-2.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50">
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1">
                  {n.doctorName} · {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{n.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Directory */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Search className="w-3.5 h-3.5 text-teal-600" />
          <span>Registered doctors</span>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or specialty…"
          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />

        {directory.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {loading ? 'Loading…' : 'No doctors registered yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {directory.map(d => {
              const already = linkedDoctorIds.has(d.id);
              return (
                <div key={d.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {d.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{d.fullName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{d.specialty || 'General Practice'}</div>
                  </div>
                  {already ? (
                    <StatusPill status={links.find(l => l.doctorId === d.id)?.status || 'pending'} />
                  ) : (
                    <button
                      onClick={() => handleRequest(d.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-[11px] font-bold transition shrink-0"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Request</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
