'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, FileText } from 'lucide-react'

/** Lightweight CSS/SVG mock of the analytics dashboard — avoids shipping a heavy screenshot. */
function DashboardPreview() {
  const bars = [42, 68, 55, 80, 48, 72, 60]
  const boxes = [0.15, 0.3, 0.55, 0.3, 0.55, 0.85, 0.55, 0.85, 1]
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b24]/70 p-4 shadow-2xl shadow-[#4f46e5]/10 backdrop-blur-xl"
    >
      {/* window chrome */}
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-[#918fa1]">analytics / 9-box-grid</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* KPI tiles */}
        {[
          { label: 'Employees', value: '5,000', tint: 'text-[#c3c0ff]' },
          { label: 'Avg KPI', value: '70.1', tint: 'text-[#4edea3]' },
          { label: 'Accuracy', value: '72.4%', tint: 'text-[#ffb695]' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-white/10 bg-[#13121b]/60 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#918fa1]">{k.label}</p>
            <p className={`mt-1 text-lg font-bold ${k.tint}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-5 gap-3">
        {/* Bar chart */}
        <div className="col-span-3 rounded-xl border border-white/10 bg-[#13121b]/60 p-3">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#918fa1]">
            Department Performance
          </p>
          <div className="flex h-24 items-end justify-between gap-1.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-full rounded-t bg-gradient-to-t from-[#4f46e5] to-[#c3c0ff]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* 9-box mini grid */}
        <div className="col-span-2 rounded-xl border border-white/10 bg-[#13121b]/60 p-3">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#918fa1]">9-Box</p>
          <div className="grid grid-cols-3 gap-1">
            {boxes.map((o, i) => (
              <div
                key={i}
                className="aspect-square rounded"
                style={{ backgroundColor: `rgba(79, 70, 229, ${o})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="about" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-8 lg:grid-cols-2">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/40 bg-[#4f46e5]/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-[#c3c0ff]">
            <Sparkles size={13} className="text-[#4edea3]" />
            AI · Machine Learning · HR Analytics
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#e4e1ee] sm:text-5xl lg:text-6xl">
            AI-Driven Performance{' '}
            <span className="bg-gradient-to-r from-[#c3c0ff] to-[#4edea3] bg-clip-text text-transparent">
              and Potential Prediction
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#c7c4d8] lg:mx-0 sm:text-lg">
            A research-grade workforce intelligence platform that maps employees onto the 9-Box
            Grid using machine learning — turning performance, potential, and engagement data into
            actionable talent decisions.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/login"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#3323cc] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4f46e5]/30 transition-all hover:shadow-[#4f46e5]/50 active:scale-95 sm:w-auto"
            >
              Launch Application
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-[#e4e1ee] backdrop-blur-md transition-all hover:bg-white/10 active:scale-95 sm:w-auto"
            >
              <FileText size={18} />
              View Documentation
            </a>
          </div>
        </div>

        {/* Preview */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-full bg-[#4f46e5]/20 blur-3xl" />
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}
