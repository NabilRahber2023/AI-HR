import {
  BrainCircuit, LineChart, Target, MessagesSquare,
  UploadCloud, Lightbulb, Search, Gauge,
} from 'lucide-react'
import SectionHeading from './SectionHeading'

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Workforce Intelligence',
    body: 'A RandomForest classifier scores raw KPI, attendance, skill, and leadership signals to predict each employee’s 9-Box placement.',
  },
  {
    icon: LineChart,
    title: 'Real-Time Analytics',
    body: 'Dashboards surface summary KPIs, salary distribution, department performance, gender balance, and the 9-Box spread from live data.',
  },
  {
    icon: Target,
    title: 'Talent Forecasting',
    body: 'Score any existing employee or run custom what-if inputs to forecast performance level, potential level, and grid position on demand.',
  },
  {
    icon: MessagesSquare,
    title: 'AI Career Coaching',
    body: 'A local-LLM chatbot streams tailored career guidance with a resilient rule-based fallback, and persists conversation history.',
  },
  {
    icon: UploadCloud,
    title: 'CSV Dataset Ingestion',
    body: 'Bulk-import workforce CSVs through a validation pipeline that cleans, de-duplicates, and auto-derives talent labels on upload.',
  },
  {
    icon: Lightbulb,
    title: 'Development Recommendations',
    body: 'A recommendation engine maps every employee’s grid placement to concrete, role-aware growth and promotion actions.',
  },
  {
    icon: Search,
    title: 'Employee Search & Profiles',
    body: 'Browse, paginate, and search the workforce, then drill into individual profiles with full performance and potential breakdowns.',
  },
  {
    icon: Gauge,
    title: 'Model Metrics & Evaluation',
    body: 'Retrain the model in-app and track accuracy, precision, recall, and F1 from the latest run on a dedicated metrics view.',
  },
]

function FeatureCard({ icon: Icon, title, body }: (typeof FEATURES)[number]) {
  return (
    <article className="glow-card relative mx-3 flex w-[300px] flex-none flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f28]/40 p-6 backdrop-blur-md hover:border-[#4f46e5]/40">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#3323cc] text-white shadow-lg shadow-[#4f46e5]/30">
        <Icon size={20} />
      </span>
      <h3 className="mb-2 text-base font-semibold text-[#e4e1ee]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#c7c4d8]">{body}</p>
    </article>
  )
}

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <SectionHeading
          eyebrow="Capabilities"
          title={
            <>
              Key System <span className="text-[#4edea3]">Features</span>
            </>
          }
        />
      </div>
      {/* Full-bleed marquee: list duplicated so the -50% loop is seamless. */}
      <div className="marquee-mask group relative overflow-hidden">
        <div className="marquee-track-rtl items-stretch py-2">
          {[...FEATURES, ...FEATURES].map((f, i) => (
            <FeatureCard key={`${f.title}-${i}`} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}
