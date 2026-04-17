import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'
import { PostEditor } from '@/components/posts/edit/PostEditor'
import { ToastContainer } from '@/components/shared/Toast'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-hidden">
        <Header title="포스팅 편집" description="본문을 수정하고 카드뉴스를 제작하세요" />
        <PostEditor postId={id} />
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  )
}
