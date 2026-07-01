import { LayoutDashboard, Upload, Users, Cpu, Bot, Lightbulb, Gauge, ShieldCheck } from 'lucide-react'
import SectionHeading from './SectionHeading'

const MODULES = [
  {
    icon: LayoutDashboard,
    title: 'Analytics Dashboard',
    body: 'Live KPIs and charts covering the entire workforce — summary stats, distributions, and 9-Box spread.',
  },
  {
    icon: Upload,
    title: 'Dataset Upload',
    body: 'Bulk-import employee data via CSV; the platform validates and ingests records into the analytics engine.',
  },
  {
    icon: Users,
    title: 'Employee Management',
    body: 'Browse, search, and inspect individual employee profiles with full performance and potential breakdowns.',
  },
  {
    icon: Cpu,
    title: 'AI Prediction Engine',
    body: 'Train the model and generate 9-Box predictions for any employee or custom input on demand.',
  },
  {
    icon: Bot,
    title: 'AI HR Chatbot',
    body: 'A conversational career coach powered by a local LLM, with a resilient rule-based fallback.',
  },
  {
    icon: Lightbulb,
    title: 'Recommendation Engine',
    body: 'Context-aware development recommendations mapped to each employee’s grid placement.',
  },
  {
    icon: Gauge,
    title: 'Model Metrics',
    body: 'A dedicated evaluation view tracking accuracy, precision, recall, and F1 from the latest training run.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication & Access',
    body: 'JWT-secured sign-up and login with role-based routing that separates admin and standard-user dashboards.',
  },
]

function ModuleCard({ icon: Icon, title, body }: (typeof MODULES)[number]) {
  return (
    <article className="glow-card group mx-3 flex w-[340px] flex-none gap-4 rounded-2xl border border-white/10 bg-[#1f1f28]/40 p-6 backdrop-blur-md hover:border-[#4f46e5]/40">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-white/10 bg-[#4f46e5]/10 text-[#c3c0ff] transition-colors group-hover:bg-[#4f46e5]/20">
        <Icon size={20} />
      </span>
      <div>
        <h3 className="mb-1 text-base font-semibold text-[#e4e1ee]">{title}</h3>
        <p className="text-sm leading-relaxed text-[#c7c4d8]">{body}</p>
      </div>
    </article>
  )
}

export default function Modules() {
  return (
    <section id="modules" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <SectionHeading eyebrow="What's inside" title="System Modules" />
      </div>
      {/* Full-bleed marquee: list duplicated so the -50% loop is seamless. */}
      <div className="marquee-mask group relative overflow-hidden">
        <div className="marquee-track items-stretch py-2">
          {[...MODULES, ...MODULES].map((m, i) => (
            <ModuleCard key={`${m.title}-${i}`} {...m} />
          ))}
        </div>
      </div>
    </section>
  )
}
