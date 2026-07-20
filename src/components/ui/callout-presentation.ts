import type { LucideIcon } from 'lucide-react';

import {
  BadgeAlert,
  Check,
  CircleAlert,
  Info,
  Key,
  LibraryBig,
  Lightbulb,
  MessageSquare,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react';

export const CALLOUT_VARIANTS = [
  'note',
  'info',
  'tip',
  'success',
  'important',
  'warning',
  'danger',
  'custom',
] as const;

export type TCalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export type TCalloutPresentation = {
  accentClassName: string;
  icon: LucideIcon;
  surfaceClassName: string;
  title: string;
  variant: TCalloutVariant;
};

const CALLOUT_PRESENTATIONS: Record<TCalloutVariant, TCalloutPresentation> = {
  note: {
    accentClassName: 'text-blue-700 dark:text-blue-300',
    icon: CircleAlert,
    surfaceClassName:
      'border-blue-200 bg-blue-50/80 dark:border-blue-900 dark:bg-blue-950/40',
    title: 'Note',
    variant: 'note',
  },
  info: {
    accentClassName: 'text-neutral-700 dark:text-neutral-300',
    icon: Info,
    surfaceClassName:
      'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-white/5',
    title: 'Info',
    variant: 'info',
  },
  tip: {
    accentClassName: 'text-green-700 dark:text-green-300',
    icon: Lightbulb,
    surfaceClassName:
      'border-green-200 bg-green-50/80 dark:border-green-900 dark:bg-green-950/40',
    title: 'Tip',
    variant: 'tip',
  },
  success: {
    accentClassName: 'text-green-700 dark:text-green-300',
    icon: Check,
    surfaceClassName:
      'border-green-200 bg-green-50/80 dark:border-green-900 dark:bg-green-950/40',
    title: 'Success',
    variant: 'success',
  },
  important: {
    accentClassName: 'text-violet-700 dark:text-violet-300',
    icon: BadgeAlert,
    surfaceClassName:
      'border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/40',
    title: 'Important',
    variant: 'important',
  },
  warning: {
    accentClassName: 'text-amber-800 dark:text-amber-300',
    icon: TriangleAlert,
    surfaceClassName:
      'border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/40',
    title: 'Warning',
    variant: 'warning',
  },
  danger: {
    accentClassName: 'text-red-700 dark:text-red-300',
    icon: OctagonAlert,
    surfaceClassName:
      'border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/40',
    title: 'Danger',
    variant: 'danger',
  },
  custom: {
    accentClassName: 'text-brand',
    icon: MessageSquare,
    surfaceClassName: 'border-brand/30 bg-brand/5',
    title: 'Callout',
    variant: 'custom',
  },
};

const LUCIDE_CALLOUT_ICONS: Record<string, LucideIcon> = {
  key: Key,
  'library-big': LibraryBig,
};

const isCalloutVariant = (variant: unknown): variant is TCalloutVariant =>
  typeof variant === 'string' &&
  CALLOUT_VARIANTS.includes(variant as TCalloutVariant);

export const getCalloutPresentation = (
  variant: unknown
): TCalloutPresentation =>
  CALLOUT_PRESENTATIONS[isCalloutVariant(variant) ? variant : 'custom'];

export const getCalloutTitle = (
  title: unknown,
  fallback: string
): string => {
  if (typeof title !== 'string') return fallback;

  return title.trim() || fallback;
};

export const getLucideCalloutIcon = (icon: unknown): LucideIcon | undefined =>
  typeof icon === 'string' ? LUCIDE_CALLOUT_ICONS[icon] : undefined;
