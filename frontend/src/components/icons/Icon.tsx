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
  User,
  LogOut,
  Calendar,
  FileText,
  Video,
  Users,
  Settings,
  Activity,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowLeft,
  ArrowRight,
  Lock,
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
  Sun,
  Moon,
  LucideProps,
} from 'lucide-react';

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
  User,
  LogOut,
  Calendar,
  FileText,
  Video,
  Users,
  Settings,
  Activity,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowLeft,
  ArrowRight,
  Lock,
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
  Sun,
  Moon,
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap.`);
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
};

export default Icon;
