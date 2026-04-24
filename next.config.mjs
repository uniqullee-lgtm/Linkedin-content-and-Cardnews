/** @type {import('next').NextConfig} */
const nextConfig = {
  // pptxgenjs는 서버 전용 — 클라이언트 번들에서 제외
  experimental: {
    serverComponentsExternalPackages: ['pptxgenjs'],
  },
}

export default nextConfig
