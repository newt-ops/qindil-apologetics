// Icon.tsx — Central icon wrapper component. This is the ONLY file allowed to import from 'lucide-react' directly.

import React from 'react';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Check,
  Plus,
  Search,
  Bell,
  BellOff,
  User,
  LogOut,
  Calendar,
  FileText,
  Video,
  Users,
  Settings,
  Activity,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Filter,
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  Mail,
  ExternalLink,
  Shield,
  BookOpen,
  Folder,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  Compass,
  Send,
  MessageSquare,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image as ImageIcon,
  Table as TableIcon,
  Link as LinkIcon,
  Unlink,
  BookMarked,
  AlertTriangle,
  Globe,
  Archive,
  Inbox,
  MapPin,
  Copy,
  Clock,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Key,
  RefreshCw,
  Sparkles,
  Share2,
  Bookmark,
  Layers,
  Camera,
  Upload,
  Scale,
  Mic,
  HelpCircle,
  Download,
  Save,
  CheckSquare,
  LucideProps,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export const iconMap = {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Check,
  Plus,
  Search,
  Bell,
  BellOff,
  User,
  LogOut,
  Calendar,
  FileText,
  Video,
  Users,
  Settings,
  Activity,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Filter,
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  Mail,
  ExternalLink,
  Shield,
  BookOpen,
  Folder,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  Compass,
  Send,
  MessageSquare,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image: ImageIcon,
  Table: TableIcon,
  Link: LinkIcon,
  Unlink,
  BookMarked,
  AlertTriangle,
  Globe,
  Archive,
  Inbox,
  MapPin,
  Copy,
  Clock,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Toggle: ToggleLeft,
  ToggleMode: Sun,
  ThemeToggle: Sun,
  Key,
  RefreshCw,
  Sparkles,
  Share2,
  Share: Share2,
  Bookmark,
  Layers,
  Camera,
  Upload,
  Scale,
  Mic,
  HelpCircle,
  Download,
  Save,
  CheckSquare,
} as const;

export type IconName = keyof typeof iconMap;

// Intelligent toggle pairs for automatic toggle mode resolution
const defaultTogglePairs: Partial<Record<IconName, IconName>> = {
  ToggleLeft: 'ToggleRight',
  ToggleRight: 'ToggleLeft',
  Toggle: 'ToggleRight',
  Sun: 'Moon',
  Moon: 'Sun',
  Eye: 'EyeOff',
  EyeOff: 'Eye',
  Lock: 'Unlock',
  Unlock: 'Lock',
  Bell: 'BellOff',
  BellOff: 'Bell',
};

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  size?: number | string;
  className?: string;
  /**
   * When true, flips the icon to its paired toggle state (e.g., ToggleLeft -> ToggleRight, Sun -> Moon, Eye -> EyeOff).
   */
  toggled?: boolean;
  /**
   * Explicit icon name to display when toggled is true.
   */
  toggleName?: IconName;
  /**
   * Callback fired when clicked in toggle mode.
   */
  onToggle?: (nextState: boolean) => void;
  /**
   * When true, renders an accessible button element that can be toggled via keyboard or click.
   */
  interactive?: boolean;
}

/**
 * Dedicated sub-component for Theme/Mode toggling to ensure other icons
 * don't subscribe to the Zustand theme store.
 */
const ThemeToggleIcon: React.FC<Omit<IconProps, 'name'>> = ({
  size = 20,
  className = '',
  toggled,
  interactive,
  onToggle,
  ...props
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = toggled !== undefined ? !toggled : theme === 'dark';
  const IconComponent = isDark ? Sun : Moon;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle(isDark);
    } else {
      toggleTheme();
    }
  };

  if (interactive || onToggle) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center p-1 rounded-md text-textMuted hover:text-gold hover:bg-surface/50 transition-colors duration-150 focus:outline-none"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <IconComponent size={size} className={className} {...(props as any)} />
      </button>
    );
  }

  return <IconComponent size={size} className={className} {...props} />;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  toggled,
  toggleName,
  onToggle,
  interactive,
  ...props
}) => {
  // 1. Check for dedicated Theme/Mode toggle handling
  if (name === 'ThemeToggle' || name === 'ToggleMode') {
    return (
      <ThemeToggleIcon
        size={size}
        className={className}
        toggled={toggled}
        interactive={interactive}
        onToggle={onToggle}
        {...props}
      />
    );
  }

  // 2. Resolve active icon name based on toggle state
  let resolvedName: IconName = name;
  if (toggled !== undefined) {
    if (toggled) {
      if (toggleName && iconMap[toggleName]) {
        resolvedName = toggleName;
      } else if (defaultTogglePairs[name]) {
        resolvedName = defaultTogglePairs[name]!;
      } else if (name === 'Toggle') {
        resolvedName = 'ToggleRight';
      }
    } else {
      if (name === 'Toggle' || name === 'ToggleRight') {
        resolvedName = 'ToggleLeft';
      }
    }
  }

  const IconComponent = iconMap[resolvedName];

  if (!IconComponent) {
    console.warn(`Icon "${resolvedName}" (base: "${name}") not found in iconMap.`);
    return null;
  }

  // 3. Interactive button wrapper if onToggle or interactive is requested
  if (interactive || onToggle) {
    const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (onToggle) {
        onToggle(!toggled);
      }
    };

    return (
      <button
        type="button"
        onClick={handleToggleClick}
        className="inline-flex items-center justify-center p-0.5 rounded transition-transform active:scale-95 focus:outline-none"
        aria-pressed={Boolean(toggled)}
      >
        <IconComponent size={size} className={className} {...(props as any)} />
      </button>
    );
  }

  return <IconComponent size={size} className={className} {...props} />;
};

export default Icon;
