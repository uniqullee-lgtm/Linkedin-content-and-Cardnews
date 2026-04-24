import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A5F',
          blue: '#4A9EDB',
          'blue-light': '#EBF5FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
