import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '타피루즈 진단센터',
    template: '%s | 타피루즈 진단센터',
  },
  description:
    '동기·성격·강점·드레일먼트부터 팀·조직 진단까지 — HRD 전문기업 타피루즈그룹의 온라인 진단 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-brand-700">
              타피루즈 진단센터
            </Link>
            <span className="text-xs text-slate-400">by 타피루즈그룹</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="mx-auto max-w-3xl space-y-1 px-4 text-xs text-slate-400">
            <p>© 타피루즈그룹. 본 진단 결과는 자기이해와 개발을 위한 참고 자료입니다.</p>
            <p>
              <Link href="/privacy" className="underline hover:text-slate-600">
                개인정보 처리방침
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
