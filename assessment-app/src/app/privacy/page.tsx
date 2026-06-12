export const metadata = { title: '개인정보 처리방침' }

// ⚠️ 운영 전 법률 검토를 거친 정식 처리방침으로 교체 필요 (초안)
export default function PrivacyPage() {
  return (
    <article className="prose-sm max-w-none space-y-4 text-slate-700">
      <h1 className="text-2xl font-bold text-slate-900">개인정보 처리방침 (초안)</h1>
      <p>
        타피루즈그룹(이하 &ldquo;회사&rdquo;)은 진단 서비스 제공을 위해 아래와 같이
        개인정보를 수집·이용합니다.
      </p>
      <h2 className="text-lg font-semibold text-slate-900">1. 수집 항목</h2>
      <p>이름(선택), 이메일(선택), 진단 응답 및 결과</p>
      <h2 className="text-lg font-semibold text-slate-900">2. 수집 목적</h2>
      <p>진단 결과 제공, 결과 링크 안내, 서비스 개선을 위한 통계 분석(비식별 처리)</p>
      <h2 className="text-lg font-semibold text-slate-900">3. 보유 기간</h2>
      <p>수집일로부터 3년 또는 삭제 요청 시까지. 요청 즉시 파기합니다.</p>
      <h2 className="text-lg font-semibold text-slate-900">4. 문의</h2>
      <p>개인정보 열람·정정·삭제 요청: 타피루즈그룹 (연락처 추가 예정)</p>
    </article>
  )
}
