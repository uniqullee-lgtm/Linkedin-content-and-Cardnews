import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'
import { SettingsForm } from '@/components/settings/SettingsForm'
import { ToastContainer } from '@/components/shared/Toast'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        <Header title="설정" description="API 키, 회사 정보, 해시태그 프리셋을 관리합니다" />
        <SettingsForm />
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  )
}
