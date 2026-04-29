import { BADGE_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

type Props = {
  level: string
  size?: 'sm' | 'md'
}

export function Badge({ level, size = 'md' }: Props) {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG.beginner

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium text-white',
      config.color,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {config.label}
    </span>
  )
}