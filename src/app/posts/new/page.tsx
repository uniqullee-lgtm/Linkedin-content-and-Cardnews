import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'
import { NewPostWizard } from '@/components/posts/new/NewPostWizard'
import { ToastContainer } from '@/components/shared/Toast'

export default function NewPostPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        <Header
          title="새 포스팅"
          description="AI가 LinkedIn 포스팅을 자동으로 작성해드립니다"
        />
        <NewPostWizard />
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  )
}
