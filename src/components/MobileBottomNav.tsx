import React from 'react';
import {
  CalendarCheck,
  Pill,
  RotateCw,
  ShieldAlert,
  Info
} from 'lucide-react';

export type MobileTab = 'today' | 'cabinet' | 'refills' | 'safety' | 'about';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  unreadAlertCount: number;
  pendingRefillCount: number;
  pendingReminderCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadAlertCount,
  pendingRefillCount,
  pendingReminderCount
}) => {
  const tabs: Array<{
    id: MobileTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'today',
      label: 'Today',
      icon: CalendarCheck,
      badge: pendingReminderCount > 0 ? pendingReminderCount : undefined,
      badgeColor: 'bg-teal-600'
    },
    {
      id: 'cabinet',
      label: 'Cabinet',
      icon: Pill
    },
    {
      id: 'refills',
      label: 'Refills',
      icon: RotateCw,
      badge: pendingRefillCount > 0 ? pendingRefillCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'safety',
      label: 'Safety',
      icon: ShieldAlert,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'about',
      label: 'About',
      icon: Info
    }
  ];

  return (
    <nav aria-label="Main Mobile Navigation" className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-zinc-800 px-2 py-1.5 transition-colors duration-200">
      <div role="tablist" className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.badge && tab.badge > 0 ? `${tab.label} (${tab.badge} pending)` : tab.label}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-teal-700 dark:text-teal-400 font-semibold scale-105'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span
                    className={`absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-0.5 text-[9px] font-bold text-white ${
                      tab.badgeColor || 'bg-rose-500'
                    } rounded-full flex items-center justify-center shadow-xs`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-teal-600 dark:bg-teal-400 mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
