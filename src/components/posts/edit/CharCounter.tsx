import { cn } from '@/lib/utils'
import { LINKEDIN_CHAR_MIN, LINKEDIN_CHAR_MAX, LINKEDIN_PREVIEW_CUTOFF } from '@/lib/constants'

interface CharCounterProps {
  count: number
}

export function CharCounter({ count }: CharCounterProps) {
  const status = count === 0 ? 'empty'
    : count < LINKEDIN_CHAR_MIN ? 'low'
    : count <= LINKEDIN_CHAR_MAX ? 'ok'
    : 'over'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden')}>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            status === 'ok' ? 'bg-green-500' :
            status === 'low' ? 'bg-yellow-400' :
            status === 'over' ? 'bg-red-500' : 'bg-gray-300'
          )}
          style={{ width: `${Math.min(100, (count / LINKEDIN_CHAR_MAX) * 100)}%` }}
        />
      </div>
      <span className={cn(
        'text-xs font-medium tabular-nums whitespace-nowrap',
        status === 'ok' ? 'text-green-600' :
        status === 'over' ? 'text-red-600' :
        status === 'low' ? 'text-yellow-600' : 'text-gray-400'
      )}>
        {count.toLocaleString()} / {LINKEDIN_CHAR_MAX.toLocaleString()}자
      </span>
    </div>
  )
}
