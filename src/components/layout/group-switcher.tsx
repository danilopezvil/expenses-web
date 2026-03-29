'use client';

import { useGroupStore } from '@/lib/stores/group.store';
import type { Group } from '@/types/api.types';

interface GroupSwitcherProps {
  onCreateGroup?: () => void;
}


export function GroupSwitcher({ onCreateGroup }: GroupSwitcherProps) {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const groups = useGroupStore((s) => s.groups);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);

  return (
    <div className="relative group/switcher">
      {/* Trigger */}
      <button type="button" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container transition-all duration-200 text-left">
        <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-on-primary text-xs font-bold shrink-0">
          {activeGroup?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">
            {activeGroup?.name ?? 'Selecciona un grupo'}
          </p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            {activeGroup ? 'Grupo activo' : 'Sin grupo activo'}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-on-surface-variant shrink-0 transition-transform duration-200 group-focus-within/switcher:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute left-0 right-0 top-full mt-1 z-50 hidden group-focus-within/switcher:block">
        <div className="bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/30 overflow-hidden">
          {groups.length === 0 && (
            <div className="px-4 py-3 text-xs text-on-surface-variant italic">
              Sin grupos disponibles
            </div>
          )}
          {groups.map((group: Group) => (
            <button
              type="button"
              key={group.id}
              onClick={() => setActiveGroup(group)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-surface-container ${
                activeGroup?.id === group.id
                  ? 'bg-surface-container text-primary font-bold'
                  : 'text-on-surface'
              }`}
            >
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {group.name[0].toUpperCase()}
              </div>
              <span className="truncate">{group.name}</span>
              {activeGroup?.id === group.id && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 ml-auto text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}

          {/* Divider + Create */}
          <div className="border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onCreateGroup}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary font-bold hover:bg-surface-container transition-colors duration-150"
            >
              <div className="w-6 h-6 rounded border-2 border-primary/40 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Crear grupo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
