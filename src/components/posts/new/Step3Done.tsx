'use client'
import Link from 'next/link'
import { CheckCircle, Edit, Layers, LayoutDashboard } from 'lucide-react'

interface Step3DoneProps {
  postId: string
  title: string
}

export function Step3Done({ postId, title }: Step3DoneProps) {
  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">포스팅이 저장되었습니다!</h3>
      <p className="text-sm text-gray-500 mb-6">「{title}」</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/posts/${postId}/edit`}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy/90"
        >
          <Edit className="w-4 h-4" /> 포스팅 편집하기
        </Link>
        <Link
          href={`/posts/${postId}/cardnews`}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-brand-navy text-brand-navy text-sm font-medium rounded-lg hover:bg-brand-blue-light"
        >
          <Layers className="w-4 h-4" /> 카드뉴스 만들기
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          <LayoutDashboard className="w-4 h-4" /> 대시보드로
        </Link>
      </div>
    </div>
  )
}
