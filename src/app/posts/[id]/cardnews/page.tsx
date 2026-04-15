import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'
import { CardNewsCreator } from '@/components/posts/cardnews/CardNewsCreator'
import { ToastContainer } from '@/components/shared/Toast'

export default async function CardNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-hidden">
        <Header title="카드뉴스 제작" description="템플릿을 선택하고 슬라이드를 편집한 후 PPT를 다운로드하세요" />
        <CardNewsCreator postId={id} />
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  )
}
