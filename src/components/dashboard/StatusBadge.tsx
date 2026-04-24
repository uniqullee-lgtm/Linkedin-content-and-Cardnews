import { cn } from '@/lib/utils'
import type { PostStatus } from '@/lib/constants'
import { POST_STATUS_LABELS } from '@/lib/constants'

const statusStyles: Record<PostStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  FINAL: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-blue-100 text-blue-700',
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', statusStyles[status])}>
      {POST_STATUS_LABELS[status]}
    </span>
  )
}
