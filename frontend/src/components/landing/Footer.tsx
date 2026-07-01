import Link from 'next/link'
import { BrainCircuit } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-[#0e0d16]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#3323cc]">
            <BrainCircuit size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-[#e4e1ee]">AI HR</span>
        </Link>

        <p className="order-last text-center text-sm text-[#918fa1] sm:order-none">
          © {year} AI HR · AI-Driven Performance &amp; Potential Prediction
        </p>

        <nav className="flex items-center gap-6 text-sm text-[#c7c4d8]">
          <a href="#features" className="transition-colors hover:text-[#e4e1ee]">Features</a>
          <a href="#modules" className="transition-colors hover:text-[#e4e1ee]">Modules</a>
          <Link href="/login" className="transition-colors hover:text-[#e4e1ee]">Launch</Link>
        </nav>
      </div>
    </footer>
  )
}
