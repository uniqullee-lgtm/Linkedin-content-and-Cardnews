import type { ContentType, PostStatus } from '@/lib/constants'

export interface PostWithTags {
  id: string
  title: string
  topic: string
  context: string
  contentType: ContentType
  draft: string | null
  finalContent: string | null
  firstComment: string | null
  status: PostStatus
  scheduledFor: string | null
  characterCount: number | null
  seriesId: string | null
  seriesOrder: number | null
  isStyleReference: boolean
  styleNotes: string | null
  createdAt: string
  updatedAt: string
  tags: { tag: { id: string; name: string } }[]
  series: { id: string; name: string; contentType: string } | null
  _count?: { cardNews: number }
}

export interface GeneratePostRequest {
  title: string
  topic: string
  context: string
  contentType: ContentType
  seriesInfo?: string
  additionalInstructions?: string
}

export interface GeneratePostResult {
  postId: string
  content: string      // 본문
  firstComment: string // 첫 댓글
}
