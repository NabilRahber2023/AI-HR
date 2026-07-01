import { Check } from 'lucide-react'
import SectionHeading from './SectionHeading'

const OBJECTIVES = [
  {
    title: 'Automate Talent Mapping',
    body: 'Replace manual calibration meetings with a reproducible model that places every employee on the 9-Box Grid.',
  },
  {
    title: 'Quantify Potential',
    body: 'Derive a defensible potential score from skills, leadership, training, and experience signals.',
  },
  {
    title: 'Benchmark Performance',
    body: 'Weight KPIs, goal completion, and attendance into a single, comparable performance index.',
  },
  {
    title: 'Drive Development',
    body: 'Translate each grid position into concrete, role-aware recommendations for growth.',
  },
]

// Indigo intensity per box, with the top-right "star" cell emphasised.
const GRID = [0.18, 0.34, 0.6, 0.34, 0.6, 0.85, 0.6, 0.85, 1]

const BOX_LABELS = [
  'Enigma', 'Growth Employee', 'Future Leader',
  'Dilemma', 'Core Employee', 'High-Impact Employee',
  'Under-Performer', 'Effective', 'Trusted Professional',
]

export default function Objectives() {
  return (
    <section id="objectives" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <SectionHeading eyebrow="Goals" title="Core Research Objectives" />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Objective list */}
          <ul className="space-y-4">
            {OBJECTIVES.map((o) => (
              <li
                key={o.title}
                className="glow-card flex gap-4 rounded-2xl border border-white/10 bg-[#1f1f28]/40 p-5 backdrop-blur-md hover:border-[#4f46e5]/40"
              >
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#00a572]/20 text-[#4edea3]">
                  <Check size={16} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#e4e1ee]">{o.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#c7c4d8]">{o.body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* 9-Box visual */}
          <div className="glow-card rounded-2xl border border-white/10 bg-[#1b1b24]/60 p-6 backdrop-blur-md hover:border-[#4f46e5]/40">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#918fa1]">
                9-Box Grid
              </span>
              <span className="font-mono text-[11px] text-[#4edea3]">High Perf · High Potential</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GRID.map((o, i) => (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-white/5 p-1 text-center text-white/80"
                  style={{ backgroundColor: `rgba(79, 70, 229, ${o})` }}
                >
                  <span className="text-sm font-bold leading-none">{i + 1}</span>
                  <span className="text-[8px] font-medium leading-tight opacity-80">{BOX_LABELS[i]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#918fa1]">
              <span>Performance →</span>
              <span>↑ Potential</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
