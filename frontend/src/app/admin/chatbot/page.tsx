'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { chatbotAPI } from '@/lib/api'
import { Send, History } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string; time: string; aiPowered?: boolean }

const fmtTime = (ts?: string) => {
  const d = ts ? new Date(ts) : new Date()
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const QUICK_CHIPS = [
  'How can I improve my KPI?',
  'Promotion roadmap',
  'Quarterly turnover analysis',
  'Diversity breakdown',
  'Stress management tips',
  'Career growth strategy',
]

export default function ChatbotPage() {
  const WELCOME: Message = {
    role: 'assistant',
    content: "Hello! I'm your HR analytics assistant. Ask me about performance improvement, talent development, retention, promotion roadmaps, or workforce strategy — and I'll help you explore it.",
    time: fmtTime(),
    aiPowered: false,
  }
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [historyLoading, setHistoryLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadHistory = async () => {
    if (historyLoading || loading) return
    setHistoryLoading(true)
    try {
      const r = await chatbotAPI.history()
      const rows: any[] = Array.isArray(r.data) ? r.data : []
      if (!rows.length) {
        setMessages([WELCOME, {
          role: 'assistant', content: 'No previous conversations yet.', time: fmtTime(), aiPowered: false,
        }])
        return
      }
      const restored: Message[] = []
      for (const h of [...rows].reverse()) {
        restored.push({ role: 'user', content: h.message, time: fmtTime(h.timestamp) })
        restored.push({ role: 'assistant', content: h.response, time: fmtTime(h.timestamp), aiPowered: true })
      }
      setMessages([WELCOME, ...restored])
    } catch {
      /* keep current conversation on failure */
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', content: msg, time }])
    setLoading(true)
    setStreamingText('')
    try {
      const full = await chatbotAPI.stream(msg, null, (acc) => setStreamingText(acc))
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: full || 'No response received.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiPowered: true,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally { setLoading(false); setStreamingText('') }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen lg:h-screen overflow-hidden bg-surface-container-low">
        {/* Chat Header */}
        <header className="px-6 h-20 flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface leading-none">AI HR Assistant</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(111,251,190,0.8)]" />
                <span className="text-label-sm text-label-sm text-secondary font-bold">AI Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            title="Load previous conversations"
            className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant text-sm disabled:opacity-60"
          >
            <History size={18} />
            <span className="hidden sm:inline">{historyLoading ? 'Loading…' : 'History'}</span>
          </button>
        </header>

        {/* Quick Chips */}
        <div className="px-6 py-4 flex gap-3 overflow-x-auto custom-scrollbar flex-shrink-0">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              className="flex-shrink-0 px-4 py-2 bg-surface-container-highest border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:border-primary hover:text-primary transition-all whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 max-w-[85%] animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse ml-auto' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
                msg.role === 'assistant' ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'
              }`}>
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-tl-none'
                }`}>
                  <p className="font-body-md text-body-md leading-relaxed">{msg.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[10px] opacity-60 ${msg.role === 'user' ? 'text-on-surface-variant' : 'text-on-surface-variant'}`}>
                    {msg.time}
                  </span>
                  {msg.role === 'assistant' && (
                    <span className={`text-[10px] ${msg.aiPowered ? 'text-secondary' : 'text-outline'}`}>
                      {msg.aiPowered ? '· AI Powered' : '· Fallback'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-[85%] animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-sm">🤖</div>
              {streamingText ? (
                <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/30 text-on-surface">
                  <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                    {streamingText}
                    <span className="ml-0.5 inline-block w-1.5 h-4 align-middle bg-primary/70 animate-pulse" />
                  </p>
                </div>
              ) : (
                <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/30 flex items-center gap-1 h-12">
                  <div className="typing-dot w-1.5 h-1.5 bg-outline rounded-full" />
                  <div className="typing-dot w-1.5 h-1.5 bg-outline rounded-full" />
                  <div className="typing-dot w-1.5 h-1.5 bg-outline rounded-full" />
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/50 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex gap-3 items-center bg-surface-container-low p-2 rounded-2xl border border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-on-surface px-2 outline-none"
              placeholder="Ask anything about your workforce..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-primary text-on-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
