import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  // If already running in standalone mode, indicate installed status or hide
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
      if (isIOS) {
        setActiveTab('ios');
      } else {
        setActiveTab('android');
      }
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        title="Install MedSafe as an App on your Phone"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Install on Phone</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">Install MedSafe on Your Phone</h3>
                  <p className="text-xs text-blue-100">Installable app with offline access and dose reminders</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('android')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'android'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Android / Chrome
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'ios'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                iPhone / iPad (iOS)
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-4">
              {activeTab === 'android' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
                    <p className="font-semibold mb-1">Android Installation Instructions:</p>
                    <ol className="list-decimal pl-4 space-y-2 mt-2">
                      <li>
                        Open this link in <strong>Google Chrome</strong> or <strong>Edge</strong> on your phone.
                      </li>
                      <li>
                        Tap the <strong>three dots menu (⋮)</strong> at the top right corner.
                      </li>
                      <li>
                        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </li>
                      <li>
                        Tap <strong>Install</strong> to confirm. The MedSafe icon will be added to your home screen and app drawer!
                      </li>
                    </ol>
                  </div>

                  {isInstallable && (
                    <button
                      onClick={async () => {
                        const res = await install();
                        if (res) setShowModal(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition"
                    >
                      <Download className="w-4 h-4" />
                      Trigger Instant Install Prompt
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      iPhone & iPad (Safari) Installation Steps:
                    </p>

                    <div className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        Open this web link in <strong>Safari</strong> on your iPhone.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> in the bottom Safari toolbar.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        Tap <strong>Add</strong> in the top-right corner. MedSafe will open as a full native-feeling app!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* What to Test Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  What to Test on Your Phone:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    • <strong>Dose Reminders</strong>: Tap "Record Dose Taken" on scheduled doses.
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    • <strong>Safety Checks</strong>: Add "Amoxicillin" for a Penicillin allergy to see real-time alerts.
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    • <strong>Offline Support</strong>: App remains responsive even if mobile data drops.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">PWA Manifest & Service Worker Active</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
