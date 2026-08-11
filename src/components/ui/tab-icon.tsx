import {
  AppleIcon,
  BoxIcon,
  BracesIcon,
  CircleIcon,
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  GlobeIcon,
  MonitorIcon,
  PackageIcon,
  ServerIcon,
  SmartphoneIcon,
  TerminalIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TTabIcon } from '@/tabs';

const ICONS = {
  apple: AppleIcon,
  box: BoxIcon,
  braces: BracesIcon,
  code: CodeIcon,
  cpu: CpuIcon,
  database: DatabaseIcon,
  globe: GlobeIcon,
  monitor: MonitorIcon,
  package: PackageIcon,
  server: ServerIcon,
  smartphone: SmartphoneIcon,
  terminal: TerminalIcon,
} as const;

export function TabIcon({
  className,
  icon,
}: {
  className?: string;
  icon?: TTabIcon;
}) {
  if (!icon) return null;

  if (icon.type === 'image') {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={cn('size-4 shrink-0 object-contain', className)}
        src={icon.src}
      />
    );
  }

  const value = icon.name.trim().toLowerCase();
  const Icon =
    ICONS[value as keyof typeof ICONS] ?? CircleIcon;

  return <Icon aria-hidden="true" className={cn('size-4 shrink-0', className)} />;
}
