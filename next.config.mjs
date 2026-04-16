/** @type {import('next').NextConfig} */
const nextConfig = {
  // pptxgenjs는 서버 전용 — 클라이언트 번들에서 제외
  experimental: {
    serverComponentsExternalPackages: ['pptxgenjs'],
  },
  // Cloud Run Docker 배포를 위한 standalone 출력
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

export default nextConfig
