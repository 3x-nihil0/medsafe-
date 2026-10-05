import React, { useState, useRef } from 'react';
import { X, Download, Upload, CheckCircle2, AlertTriangle, Database, ShieldAlert, FileText } from 'lucide-react';
import { toLocalDateStr } from '../lib/dateUtils';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullDatabaseState: any;
  onRestoreState: (state: any) => void;
}

export const BackupExportModal: React.FC<BackupExportModalProps> = ({
  isOpen,
  onClose,
  fullDatabaseState,
  onRestoreState,
}) => {
  const [importedJson, setImportedJson] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string; issues?: any[] }>({
    type: 'idle',
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const dataStr = JSON.stringify(fullDatabaseState, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medsafe_backup_${toLocalDateStr()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setImportStatus({ type: 'error', message: err?.message || 'Could not create the backup file.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportedJson(text);
      setImportStatus({ type: 'idle', message: `Loaded file: ${file.name} (${Math.round(file.size / 1024)} KB)` });
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    setImportStatus({ type: 'loading', message: 'Validating backup structure…' });

    try {
      const parsed = JSON.parse(importedJson);
      const requiredCollections = ['patients', 'medications', 'allergies'];
      const missing = requiredCollections.filter(k => !Array.isArray(parsed[k]));
      if (missing.length > 0) {
        throw new Error(`Not a MedSafe backup - missing: ${missing.join(', ')}.`);
      }

      onRestoreState(parsed);
      setImportStatus({
        type: 'success',
        message: `Restored ${parsed.patients.length} profile(s), ${parsed.medications.length} medication(s) and ${parsed.allergies.length} allergy record(s) to this device.`,
      });

      setTimeout(() => onClose(), 1500);
    } catch (e: any) {
      setImportStatus({
        type: 'error',
        message: e.message || 'Invalid JSON. The file could not be restored.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
        className="bg-white dark:bg-zinc-900 rounded-md shadow-xl max-w-xl w-full border border-slate-200 dark:border-zinc-800 overflow-hidden text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <h2 id="backup-modal-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Backup &amp; Restore
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close backup modal"
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-300">
            <ShieldAlert className="w-4 h-4 text-slate-600 dark:text-zinc-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Everything lives on this device. Export a JSON file to move your profiles to another phone, or to keep a
              copy in case you clear browser data. Restoring replaces the current data on this device.
            </p>
          </div>

          {/* Export Section */}
          <div className="p-3.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">Export System Snapshot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                Schema v3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
              Exports profiles, medications, allergies, interaction rules, reminders, refills and alert history.
            </p>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md font-medium flex items-center gap-1.5 transition text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download backup (JSON)</span>
            </button>
          </div>

          {/* Restore Section */}
          <div className="p-3.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">Restore from a backup</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                On-device
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md text-xs font-medium flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 self-center">or paste JSON below:</span>
            </div>

            <textarea
              value={importedJson}
              onChange={(e) => setImportedJson(e.target.value)}
              placeholder="Paste previously exported JSON snapshot here..."
              rows={4}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-md text-[11px] font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400 text-slate-800 dark:text-zinc-200"
            />

            {importStatus.type !== 'idle' && (
              <div className={`p-2.5 rounded-md text-[11px] flex items-start gap-2 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : importStatus.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
              }`}>
                {importStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {importStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="font-medium leading-relaxed">{importStatus.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleRestore}
                disabled={!importedJson.trim() || importStatus.type === 'loading'}
                className="px-3 py-1.5 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md font-medium flex items-center gap-1.5 transition text-xs disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{importStatus.type === 'loading' ? 'Validating…' : 'Restore this backup'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
