import { ShieldCheck, GitBranch, Database } from 'lucide-react'
import SectionHeading from './SectionHeading'

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Cognitive Bias Mitigation',
    body: 'Traditional talent reviews are skewed by recency and affinity bias. A data-driven model grounds every placement in measurable performance and potential signals.',
  },
  {
    icon: GitBranch,
    title: 'Prediction Continuity',
    body: 'Static annual ratings go stale fast. Continuous ML scoring keeps the 9-Box Grid current as KPIs, attendance, and engagement metrics evolve.',
  },
  {
    icon: Database,
    title: 'Data Integrity',
    body: 'Built on a validated schema of 20+ workforce features, ensuring predictions are reproducible, auditable, and resistant to noisy inputs.',
  },
]

export default function ResearchBackground() {
  return (
    <section id="research" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <SectionHeading eyebrow="Why it matters" title="Research Background" />
        <div className="grid gap-6 md:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="glow-card group rounded-2xl border border-white/10 bg-[#1f1f28]/40 p-6 backdrop-blur-md hover:border-[#4f46e5]/40"
            >
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#4f46e5]/10 text-[#c3c0ff]">
                <Icon size={20} />
              </span>
              <h3 className="mb-2 text-lg font-semibold text-[#e4e1ee]">{title}</h3>
              <p className="text-sm leading-relaxed text-[#c7c4d8]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
