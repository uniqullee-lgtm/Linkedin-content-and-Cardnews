// 순수 SVG 레이더 차트 (서버 렌더링 가능 — 차트 라이브러리 의존성 없음)
interface RadarChartProps {
  data: { label: string; value: number }[]
  min?: number
  max?: number
}

const SIZE = 320
const CENTER = SIZE / 2
const RADIUS = 110

function pointAt(index: number, total: number, ratio: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio]
}

export default function RadarChart({ data, min = 1, max = 5 }: RadarChartProps) {
  const n = data.length
  if (n < 3) return null

  const rings = [0.25, 0.5, 0.75, 1]
  const toRatio = (v: number) => Math.max(0.04, (v - min) / (max - min))
  const polygon = data.map((d, i) => pointAt(i, n, toRatio(d.value)).join(',')).join(' ')

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-xs"
      role="img"
      aria-label={data.map((d) => `${d.label} ${d.value}점`).join(', ')}
    >
      {rings.map((r) => (
        <polygon
          key={r}
          points={data.map((_, i) => pointAt(i, n, r).join(',')).join(' ')}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pointAt(i, n, 1)
        return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />
      })}
      <polygon points={polygon} fill="#4f6ef7" fillOpacity={0.18} stroke="#3b55e6" strokeWidth={2} />
      {data.map((d, i) => {
        const [x, y] = pointAt(i, n, toRatio(d.value))
        return <circle key={i} cx={x} cy={y} r={3.5} fill="#3b55e6" />
      })}
      {data.map((d, i) => {
        const [x, y] = pointAt(i, n, 1.22)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-600"
            fontSize={12}
            fontWeight={500}
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
