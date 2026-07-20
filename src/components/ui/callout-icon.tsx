import type { TCalloutPresentation } from '@/components/ui/callout-presentation';

import { getLucideCalloutIcon } from '@/components/ui/callout-presentation';
import { cn } from '@/lib/utils';

type TCalloutIconProps = {
  presentation: TCalloutPresentation;
  className?: string;
  icon?: unknown;
  iconLibrary?: unknown;
};

export function CalloutIcon({
  className,
  icon,
  iconLibrary,
  presentation,
}: TCalloutIconProps) {
  const LucideIcon =
    iconLibrary === 'lucide' ? getLucideCalloutIcon(icon) : undefined;

  if (LucideIcon) {
    return (
      <LucideIcon
        aria-hidden="true"
        className={cn('size-4 shrink-0', className)}
      />
    );
  }

  if (iconLibrary !== 'lucide' && typeof icon === 'string' && icon.trim()) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-4 shrink-0 items-center justify-center text-base leading-none',
          className
        )}
      >
        {icon}
      </span>
    );
  }

  const DefaultIcon = presentation.icon;

  return (
    <DefaultIcon
      aria-hidden="true"
      className={cn('size-4 shrink-0', className)}
    />
  );
}
