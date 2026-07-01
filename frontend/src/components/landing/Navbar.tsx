'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BrainCircuit, Menu, X, ArrowRight } from 'lucide-react'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Modules', href: '#modules' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Technology', href: '#technology' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#0e0d16]/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="AI HR home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#3323cc] shadow-lg shadow-[#4f46e5]/30">
            <BrainCircuit size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-[#e4e1ee]">AI HR</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#c7c4d8] transition-colors hover:bg-white/5 hover:text-[#e4e1ee]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4f46e5] to-[#3323cc] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#4f46e5]/30 transition-all hover:shadow-[#4f46e5]/50 active:scale-95"
          >
            Launch Application
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#e4e1ee] hover:bg-white/5 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#0e0d16]/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-[#c7c4d8] hover:bg-white/5 hover:text-[#e4e1ee]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#4f46e5] to-[#3323cc] px-4 py-3 text-sm font-semibold text-white"
          >
            Launch Application
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </header>
  )
}
