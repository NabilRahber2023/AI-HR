import { Upload, Cpu, Grid3x3, TrendingUp } from 'lucide-react'
import SectionHeading from './SectionHeading'

const STEPS = [
  { icon: Upload, title: 'CSV Upload', body: 'Import workforce data through a validated ingestion pipeline.' },
  { icon: Cpu, title: 'AI Processing', body: 'Features are engineered and scored by the trained ML model.' },
  { icon: Grid3x3, title: '9-Box Mapping', body: 'Each employee is placed onto the performance × potential grid.' },
  { icon: TrendingUp, title: 'Predictions & Insights', body: 'Recommendations and forecasts are surfaced to decision-makers.' },
]

export default function Workflow() {
  return (
    <section id="workflow" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <SectionHeading eyebrow="How it works" title="System Workflow" />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative">
              {/* connector */}
              {i < STEPS.length - 1 && (
                <span className="absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-[#4f46e5]/60 to-transparent lg:block" />
              )}
              <div className="flex flex-col items-center text-center">
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#1f1f28]/60 text-[#c3c0ff] backdrop-blur-md">
                  <Icon size={26} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#3323cc] font-mono text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#e4e1ee]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#c7c4d8]">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
