interface Props {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
}

/** Centered section heading used across landing sections for consistent rhythm. */
export default function SectionHeading({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#c3c0ff]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-[#e4e1ee] sm:text-4xl">{title}</h2>
      <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent" />
      {subtitle && <p className="mt-4 text-base leading-relaxed text-[#c7c4d8]">{subtitle}</p>}
    </div>
  )
}
