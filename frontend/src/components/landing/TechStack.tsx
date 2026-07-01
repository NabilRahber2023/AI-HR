'use client'
import SectionHeading from './SectionHeading'

// Every technology below is genuinely present in the codebase
// (frontend/package.json, requirements.txt, .env / Ollama, models pipeline).
// `slug` maps to the official Simple Icons logo served from its CDN.
const STACK = [
  { name: 'Next.js', role: 'Frontend', slug: 'nextdotjs' },
  { name: 'React', role: 'Frontend', slug: 'react' },
  { name: 'TypeScript', role: 'Language', slug: 'typescript' },
  { name: 'Tailwind CSS', role: 'Styling', slug: 'tailwindcss' },
  { name: 'Recharts', role: 'Charts', slug: 'recharts' },
  { name: 'Zustand', role: 'State', slug: 'reactivex' },
  { name: 'Axios', role: 'HTTP Client', slug: 'axios' },
  { name: 'React Hook Form', role: 'Forms', slug: 'reacthookform' },
  { name: 'FastAPI', role: 'Backend', slug: 'fastapi' },
  { name: 'Python', role: 'Language', slug: 'python' },
  { name: 'Pydantic', role: 'Validation', slug: 'pydantic' },
  { name: 'Uvicorn', role: 'ASGI Server', slug: 'gunicorn' },
  { name: 'Scikit-Learn', role: 'ML · RandomForest', slug: 'scikitlearn' },
  { name: 'Pandas', role: 'Data', slug: 'pandas' },
  { name: 'NumPy', role: 'Data', slug: 'numpy' },
  { name: 'Ollama', role: 'AI Model', slug: 'ollama' },
  { name: 'SQLAlchemy', role: 'ORM', slug: 'sqlalchemy' },
  { name: 'PostgreSQL', role: 'Database', slug: 'postgresql' },
  { name: 'SQLite', role: 'Database', slug: 'sqlite' },
  { name: 'JWT', role: 'Authentication', slug: 'jsonwebtokens' },
]

function TechCard({ name, role, slug }: { name: string; role: string; slug: string }) {
  return (
    <div className="glow-card mx-3 flex w-[210px] flex-none items-center gap-4 rounded-2xl border border-white/10 bg-[#1f1f28]/40 p-5 backdrop-blur-md hover:border-[#4f46e5]/40">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/90 shadow-sm">
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={name}
          width={24}
          height={24}
          loading="lazy"
          className="h-6 w-6"
          onError={(e) => {
            const parent = e.currentTarget.parentElement
            if (!parent) return
            parent.classList.add('text-sm', 'font-bold', 'text-[#1f1f28]')
            parent.textContent = name.charAt(0)
          }}
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-bold tracking-tight text-[#e4e1ee]">{name}</p>
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-[#918fa1]">
          {role}
        </p>
      </div>
    </div>
  )
}

export default function TechStack() {
  return (
    <section id="technology" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <SectionHeading eyebrow="Engineering" title="Technology Stack" />
      </div>
      {/* Full-bleed marquee: track is duplicated so the -50% loop is seamless. */}
      <div className="marquee-mask group relative overflow-hidden">
        <div className="marquee-track py-2">
          {[...STACK, ...STACK].map((t, i) => (
            <TechCard key={`${t.name}-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}
