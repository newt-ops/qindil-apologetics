import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon, { IconName } from '../icons/Icon';
import { useHasRole } from '../../hooks/useHasRole';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'Navigation' | 'Actions' | 'Platform';
  icon: IconName;
  path?: string;
  action?: () => void;
  superAdminOnly?: boolean;
  shortcut?: string;
}

export interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isSuperAdmin = useHasRole('superAdmin');

  const allCommands: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        id: 'action-assign-task',
        title: 'Assign New Task',
        description: 'Create an editorial or research assignment for team members',
        category: 'Actions',
        icon: 'Plus',
        path: '/admin/tasks/assign',
        superAdminOnly: true,
      },
      {
        id: 'action-new-article',
        title: 'Create Research Article',
        description: 'Start drafting a new symposium article or refutation paper',
        category: 'Actions',
        icon: 'FileText',
        path: '/admin/articles',
      },
      {
        id: 'action-schedule-event',
        title: 'Schedule Operations Event',
        description: 'Add a new deadline, research sync, or symposium date',
        category: 'Actions',
        icon: 'Calendar',
        path: '/admin/events',
        superAdminOnly: true,
      },
      {
        id: 'action-new-topic',
        title: 'Manage Topics & Disciplines',
        description: 'Organize research categories, tags, and topic taxonomies',
        category: 'Actions',
        icon: 'Tag',
        path: '/admin/topics',
        superAdminOnly: true,
      },

      // Operations Navigation
      {
        id: 'nav-workspace',
        title: 'Operations Workspace',
        description: 'Personal task queue, assigned drafts, and active deadlines',
        category: 'Navigation',
        icon: 'Folder',
        path: '/admin/workspace',
      },
      {
        id: 'nav-articles',
        title: 'My Articles & Drafts',
        description: 'View, edit, and track status of your editorial publications',
        category: 'Navigation',
        icon: 'FileText',
        path: '/admin/articles',
      },
      {
        id: 'nav-calendar',
        title: 'Operations Calendar',
        description: 'Team schedule, milestones, and upcoming submission dates',
        category: 'Navigation',
        icon: 'Calendar',
        path: '/admin/calendar',
      },

      // SuperAdmin Management Navigation
      {
        id: 'nav-review-queue',
        title: 'Editorial Review Queue',
        description: 'Inspect pending article submissions awaiting approval',
        category: 'Navigation',
        icon: 'Eye',
        path: '/admin/review-queue',
        superAdminOnly: true,
      },
      {
        id: 'nav-team',
        title: 'Team Roster & Members',
        description: 'Manage staff credentials, roles, and research assignments',
        category: 'Navigation',
        icon: 'Users',
        path: '/admin/team',
        superAdminOnly: true,
      },
      {
        id: 'nav-tasks',
        title: 'All Platform Tasks',
        description: 'Full organizational task board across all staff',
        category: 'Navigation',
        icon: 'CheckSquare',
        path: '/admin/tasks',
        superAdminOnly: true,
      },
      {
        id: 'nav-events',
        title: 'Event Management',
        description: 'Manage institutional events, lectures, and live sessions',
        category: 'Navigation',
        icon: 'Calendar',
        path: '/admin/events',
        superAdminOnly: true,
      },
      {
        id: 'nav-contact',
        title: 'Contact Inbox',
        description: 'Review public inquiries and apologetics refutation requests',
        category: 'Navigation',
        icon: 'Mail',
        path: '/admin/contact-inbox',
        superAdminOnly: true,
      },
      {
        id: 'nav-analytics',
        title: 'Platform Analytics',
        description: 'Reader engagement, view metrics, and publication trends',
        category: 'Navigation',
        icon: 'Activity',
        path: '/admin/analytics',
        superAdminOnly: true,
      },
      {
        id: 'nav-audit',
        title: 'Security Audit Log',
        description: 'Inspect authentication events, role changes, and system audits',
        category: 'Navigation',
        icon: 'Shield',
        path: '/admin/audit-log',
        superAdminOnly: true,
      },
      {
        id: 'nav-settings',
        title: 'Site Settings',
        description: 'Platform branding, maintenance mode, and system parameters',
        category: 'Navigation',
        icon: 'Settings',
        path: '/admin/settings',
        superAdminOnly: true,
      },

      // Platform Links
      {
        id: 'plat-member-dash',
        title: 'Personal Member Profile',
        description: 'Switch to public reader profile, bookmarks, and Telegram link',
        category: 'Platform',
        icon: 'User',
        path: '/dashboard',
      },
      {
        id: 'plat-main-site',
        title: 'Public Library Portal',
        description: 'Open public research catalog and articles repository',
        category: 'Platform',
        icon: 'Globe',
        path: '/',
      },
    ],
    []
  );

  // Filter commands by role and search query
  const filteredCommands = useMemo(() => {
    const term = search.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      if (cmd.superAdminOnly && !isSuperAdmin) return false;
      if (!term) return true;
      return (
        cmd.title.toLowerCase().includes(term) ||
        (cmd.description && cmd.description.toLowerCase().includes(term)) ||
        cmd.category.toLowerCase().includes(term)
      );
    });
  }, [allCommands, search, isSuperAdmin]);

  // Reset search and selection when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset index when search term changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Execute selected command
  const executeCommand = (cmd: CommandItem) => {
    onClose();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.path) {
      navigate(cmd.path);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-[12vh] sm:pt-[15vh]">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-border/80 dark:border-white/10 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-apple-float overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Header: Search Input Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-border/60">
              <Icon name="Search" size={18} className="text-gold shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search admin operations..."
                className="w-full bg-transparent text-sm sm:text-base text-text placeholder-textMuted outline-none font-medium"
              />
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold text-textMuted bg-bg/80 border border-border/80 rounded-md shadow-apple-sm">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y-0"
              tabIndex={-1}
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-textMuted">
                  <Icon name="Search" size={24} className="mx-auto text-textMuted/40 mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-text">No commands found</p>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Try searching for articles, tasks, roster, settings, or analytics.
                  </p>
                </div>
              ) : (
                filteredCommands.map((cmd, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? 'bg-gold/15 text-gold border border-gold/30 shadow-apple-sm'
                          : 'text-text hover:bg-surface border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-gold text-bg font-bold'
                              : 'bg-gold/10 text-gold border border-gold/20'
                          }`}
                        >
                          <Icon name={cmd.icon} size={15} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isSelected ? 'text-gold' : 'text-text'
                            }`}
                          >
                            {cmd.title}
                          </p>
                          {cmd.description && (
                            <p className="text-[11px] text-textMuted truncate leading-tight">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-full bg-bg/80 border border-border/80 text-textMuted">
                          {cmd.category}
                        </span>
                        {isSelected && (
                          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gold bg-gold/10 border border-gold/30 rounded-md">
                            ↵
                          </kbd>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 bg-bg/60 text-[11px] text-textMuted">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 rounded bg-surface border border-border text-[10px] font-mono">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.2 rounded bg-surface border border-border text-[10px] font-mono">
                    ↓
                  </kbd>
                  <span>Navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 rounded bg-surface border border-border text-[10px] font-mono">
                    ↵
                  </kbd>
                  <span>Open</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-textMuted">Qindil Command Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminCommandPalette;
