import React, { useCallback, useEffect, useState } from 'react';
import {
  Stethoscope,
  LogOut,
  RefreshCw,
  Check,
  X,
  ArrowLeft,
  Pill,
  FileText,
  MessageSquare,
  AlertTriangle,
  Send,
  ClipboardList
} from 'lucide-react';
import type { CloudProfile, CareLink, CloudMessage, ClinicalNote, MedSnapshot } from '../types';
import {
  fetchDoctorLinks,
  respondToCareLink,
  fetchMessages,
  sendMessage,
  fetchNotes,
  addNote,
  fetchSnapshot,
  friendlyError
} from '../lib/cloud';

interface DoctorDashboardProps {
  profile: CloudProfile;
  onSignOut: () => void;
}

interface PatientDetail {
  link: CareLink;
  snapshot: MedSnapshot | null;
  notes: ClinicalNote[];
  messages: CloudMessage[];
  noteDraft: string;
  messageDraft: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ profile, onSignOut }) => {
  const [links, setLinks] = useState<CareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLinks(await fetchDoctorLinks(profile.id));
    } catch (err) {
      setError(friendlyError(err) || 'Could not load your patients.');
    } finally {
      setLoading(false);
    }
  }, [profile.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openPatient = async (link: CareLink) => {
    setError(null);
    try {
      const [snapshot, notes, messages] = await Promise.all([
        fetchSnapshot(link.patientId),
        fetchNotes(link.patientId),
        fetchMessages(link.id)
      ]);
      setDetail({ link, snapshot, notes, messages, noteDraft: '', messageDraft: '' });
    } catch (err) {
      setError(friendlyError(err) || 'Could not open the patient.');
    }
  };

  // Poll the open patient thread
  useEffect(() => {
    if (!detail) return;
    const linkId = detail.link.id;
    let alive = true;
    const load = async () => {
      try {
        const ms = await fetchMessages(linkId);
        if (alive) setDetail(prev => (prev && prev.link.id === linkId ? { ...prev, messages: ms } : prev));
      } catch {
        /* transient */
      }
    };
    const interval = setInterval(load, 15_000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [detail?.link.id]);

  const respond = async (linkId: string, status: 'active' | 'declined') => {
    setBusy(true);
    setError(null);
    try {
      await respondToCareLink(linkId, status);
      await refresh();
    } catch (err) {
      setError(friendlyError(err) || 'Could not update the request.');
    } finally {
      setBusy(false);
    }
  };

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !detail.noteDraft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addNote(detail.link.id, profile.id, detail.link.patientId, detail.noteDraft);
      const notes = await fetchNotes(detail.link.patientId);
      setDetail(prev => (prev ? { ...prev, notes, noteDraft: '' } : prev));
    } catch (err) {
      setError(friendlyError(err) || 'Could not save the note.');
    } finally {
      setBusy(false);
    }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !detail.messageDraft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await sendMessage(detail.link.id, profile.id, detail.messageDraft);
      const messages = await fetchMessages(detail.link.id);
      setDetail(prev => (prev ? { ...prev, messages, messageDraft: '' } : prev));
    } catch (err) {
      setError(friendlyError(err) || 'Message failed.');
    } finally {
      setBusy(false);
    }
  };

  const pending = links.filter(l => l.status === 'pending');
  const active = links.filter(l => l.status === 'active');

  // ------------------------------------------------ patient detail
  if (detail) {
    const snap = detail.snapshot;
    return (
      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4 bg-slate-50 dark:bg-zinc-950">
        {error && (
          <div role="alert" className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-[11px]">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetail(null)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
            aria-label="Back to patients"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{detail.link.patientName || 'Patient'}</h2>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Under your care since {new Date(detail.link.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Shared medication list */}
        <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
            <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
            <span>Shared medication list</span>
            {snap?.updatedAt && (
              <span className="ml-auto text-[9px] font-normal text-slate-400">
                updated {new Date(snap.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {!snap ? (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              The patient has not shared a medication list yet. Ask them to open Care → Share list.
            </p>
          ) : (
            <>
              {snap.conditions.length > 0 && (
                <div className="text-[11px]">
                  <span className="text-slate-500 dark:text-zinc-400 mr-2">Conditions:</span>
                  <span className="font-semibold">{snap.conditions.join(' · ')}</span>
                </div>
              )}

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400 mb-1">Allergies</div>
                {snap.allergies.length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">None documented.</p>
                ) : (
                  <div className="space-y-1">
                    {snap.allergies.map((a, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-semibold">{a.allergenName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${a.reactionSeverity === 'severe' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                          {a.reactionSeverity}
                        </span>
                        {a.symptoms && <span className="text-slate-400">— {a.symptoms}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400 mb-1">
                  Active medications ({snap.medications.length})
                </div>
                {snap.medications.length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">No active prescriptions recorded.</p>
                ) : (
                  <div className="space-y-1.5">
                    {snap.medications.map((m, i) => (
                      <div key={i} className="p-2 rounded border border-slate-200 dark:border-zinc-700 text-[11px]">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-bold">
                            <Pill className="w-3 h-3 inline text-teal-600 mr-1" />
                            {m.drugName} {m.dosage}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">{m.quantityRemaining} left</span>
                        </div>
                        <div className="text-slate-600 dark:text-zinc-400 mt-0.5">
                          {m.schedule} · {m.quantityPerDose} per dose · {m.dosesPerDay}× daily
                          {m.conditionCategory && ` · for ${m.conditionCategory}`}
                        </div>
                        {m.instructions && <div className="text-slate-500 dark:text-zinc-500 mt-0.5 italic">{m.instructions}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Clinical notes */}
        <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical notes</span>
          </div>

          <form onSubmit={saveNote} className="space-y-2">
            <textarea
              value={detail.noteDraft}
              onChange={e => setDetail(prev => (prev ? { ...prev, noteDraft: e.target.value } : prev))}
              placeholder="e.g. Continue current dose. Review BP at next visit. Avoid NSAIDs with the listed allergy."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-y"
            />
            <button
              type="submit"
              disabled={busy || !detail.noteDraft.trim()}
              className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition disabled:opacity-50"
            >
              Save note for patient
            </button>
          </form>

          {detail.notes.length > 0 && (
            <div className="space-y-2 pt-1">
              {detail.notes.map(n => (
                <div key={n.id} className="p-2.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1">
                    {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{n.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800 font-semibold text-xs text-slate-800 dark:text-zinc-200">
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>Messages</span>
          </div>
          <div className="p-3 space-y-2 max-h-[34vh] overflow-y-auto min-h-[120px]">
            {detail.messages.length === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center py-4">No messages yet.</p>
            )}
            {detail.messages.map(m => {
              const mine = m.senderId === profile.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-snug whitespace-pre-wrap break-words ${
                      mine ? 'bg-teal-700 text-white rounded-br-md' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-md'
                    }`}
                  >
                    {m.body}
                    <div className={`text-[9px] mt-1 ${mine ? 'text-teal-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                      {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={sendMsg} className="flex items-center gap-2 p-2 border-t border-slate-200 dark:border-zinc-800">
            <input
              value={detail.messageDraft}
              onChange={e => setDetail(prev => (prev ? { ...prev, messageDraft: e.target.value } : prev))}
              placeholder="Message patient…"
              className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !detail.messageDraft.trim()}
              className="p-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white transition disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------ root view
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4 bg-slate-50 dark:bg-zinc-950">
      {/* Doctor header */}
      <div className="bg-slate-900 dark:bg-zinc-900 text-white rounded-md p-4 border border-slate-800 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded bg-teal-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{profile.fullName}</div>
            <div className="text-[11px] text-slate-400 truncate">{profile.specialty || 'General Practice'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-[11px]">
          {error}
        </div>
      )}

      {/* Pending requests */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Connection requests</span>
          {pending.length > 0 && (
            <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">No pending requests.</p>
        ) : (
          pending.map(l => (
            <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                {(l.patientName || 'P').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{l.patientName}</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">wants to connect with you</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => respond(l.id, 'active')}
                  disabled={busy}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                  aria-label="Approve"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => respond(l.id, 'declined')}
                  disabled={busy}
                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-950 transition disabled:opacity-50"
                  aria-label="Decline"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* My patients */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
          <span>My patients ({active.length})</span>
        </div>

        {active.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {loading ? 'Loading…' : 'No patients connected yet. Approve a request above to begin.'}
          </p>
        ) : (
          active.map(l => (
            <button
              key={l.id}
              onClick={() => openPatient(l)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition text-left active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                {(l.patientName || 'P').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{l.patientName}</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">View shared list, notes & messages</div>
              </div>
              <MessageSquare className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
