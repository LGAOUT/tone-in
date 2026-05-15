import { BADGE_CONFIG } from '@/types'

type Props = {
  level: string
  size?: 'sm' | 'md'
}

export function Badge({ level, size = 'md' }: Props) {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG.beginner

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}`}
      style={{
        background: config.bg,
        color: config.text,
        border: `0.5px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  )
}
