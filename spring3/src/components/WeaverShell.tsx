import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'

export type WeaverMode = 'ask' | 'scribe'

type ChatMessage = {
  id: number
  role: 'user' | 'weaver'
  text: string
}

type WeaverShellProps = {
  variant: 'page' | 'reports'
  mode: WeaverMode
  onModeChange?: (mode: WeaverMode) => void
  title: string
  kicker: string
  prompts: readonly string[]
  replyFor: (prompt: string) => string
  onSubmit?: (prompt: string) => void
  extra?: ReactNode
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function promptLead(mode: WeaverMode) {
  return mode === 'scribe' ? 'Ask Weaver Scribe' : 'Ask Weaver'
}

function promptTails(prompts: readonly string[], lead: string) {
  const prefix = lead.toLowerCase()
  return prompts.map((prompt) => {
    if (prompt.toLowerCase().startsWith(prefix)) {
      return prompt.slice(lead.length).trimStart()
    }
    return prompt
  })
}

function useTypewriter(phrases: readonly string[], running: boolean) {
  const [text, setText] = useState('')
  const script = phrases.join('\n')

  useEffect(() => {
    const first = phrases[0] ?? ''
    if (!running || phrases.length === 0) {
      return
    }
    if (prefersReducedMotion()) {
      setText(first)
      return
    }

    let phrase = 0
    let index = 0
    let deleting = false
    let timer = 0

    const tick = () => {
      const current = phrases[phrase] ?? ''
      if (!deleting) {
        index += 1
        setText(current.slice(0, index))
        if (index >= current.length) {
          deleting = true
          timer = window.setTimeout(tick, 2600)
          return
        }
        timer = window.setTimeout(tick, 110)
        return
      }
      index -= 1
      setText(current.slice(0, Math.max(0, index)))
      if (index <= 0) {
        deleting = false
        phrase = (phrase + 1) % phrases.length
        timer = window.setTimeout(tick, 640)
        return
      }
      timer = window.setTimeout(tick, 55)
    }

    setText('')
    timer = window.setTimeout(tick, 480)
    return () => window.clearTimeout(timer)
  }, [script, running, phrases])

  return text
}

function WeaverShell({
  variant,
  mode,
  onModeChange,
  title,
  kicker,
  prompts,
  replyFor,
  onSubmit,
  extra,
}: WeaverShellProps) {
  const fieldId = useId()
  const logRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingId, setTypingId] = useState<number | null>(null)
  const nextId = useRef(1)
  const pendingReply = useRef<{ id: number; text: string } | null>(null)
  const lead = promptLead(mode)
  const tails = useMemo(() => promptTails(prompts, lead), [prompts, lead])
  const ghost = useTypewriter(tails, draft.length === 0)
  const Heading = variant === 'page' ? 'h1' : 'p'
  const markSize = variant === 'page' ? 42 : 34

  useEffect(() => {
    const log = logRef.current
    if (!log) {
      return
    }
    log.scrollTop = log.scrollHeight
  }, [messages, typingId])

  useEffect(() => {
    if (typingId === null) {
      return
    }
    const pending = pendingReply.current
    if (!pending || pending.id !== typingId) {
      return
    }
    const full = pending.text
    if (prefersReducedMotion()) {
      setMessages((current) =>
        current.map((item) => (item.id === typingId ? { ...item, text: full } : item)),
      )
      setTypingId(null)
      return
    }
    let shown = 0
    const timer = window.setInterval(() => {
      shown += 2
      const next = full.slice(0, shown)
      setMessages((current) =>
        current.map((item) => (item.id === typingId ? { ...item, text: next } : item)),
      )
      if (shown >= full.length) {
        window.clearInterval(timer)
        setTypingId(null)
      }
    }, 16)
    return () => window.clearInterval(timer)
  }, [typingId])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const prompt = draft.trim()
    if (!prompt || typingId !== null) {
      return
    }
    const userId = nextId.current++
    const replyId = nextId.current++
    const reply = replyFor(prompt)
    onSubmit?.(prompt)
    pendingReply.current = { id: replyId, text: reply }
    setMessages((current) => [
      ...current,
      { id: userId, role: 'user', text: prompt },
      { id: replyId, role: 'weaver', text: '' },
    ])
    setDraft('')
    window.setTimeout(() => setTypingId(replyId), 180)
  }

  return (
    <section className={`weaver-shell is-${variant}${mode === 'scribe' ? ' is-scribe' : ''}`}>
      <header className="weaver-shell-head">
        <span className={`weaver-mark-live${variant === 'reports' ? ' is-compact' : ''}`}>
          <img src="/weaver-mark-scribe.svg" alt="" width={markSize} height={markSize} />
        </span>
        <div>
          <Heading>{title}</Heading>
          <p>{kicker}</p>
        </div>
        {onModeChange ? (
          <div className="weaver-shell-modes" role="radiogroup" aria-label="Weaver tool">
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'ask'}
              onClick={() => onModeChange('ask')}
            >
              Ask Weaver
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'scribe'}
              onClick={() => onModeChange('scribe')}
            >
              Weaver Scribe
            </button>
          </div>
        ) : null}
      </header>
      <div className="weaver-shell-log" ref={logRef}>
        {messages.length === 0 ? (
          <p className="weaver-shell-empty">
            {variant === 'reports'
              ? mode === 'ask'
                ? 'Ask about this agenda. A reply can rewrite it.'
                : 'Record this meeting, then ask for the minutes.'
              : mode === 'ask'
                ? 'Ask about this workspace. Replies stay in this demo.'
                : 'Weaver Scribe drafts minutes, summaries, and next steps.'}
          </p>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`weaver-turn is-${message.role}`}>
              {message.role === 'weaver' ? (
                <img className="weaver-mark-quiet" src="/weaver-mark-scribe.svg" alt="" width={26} height={26} />
              ) : null}
              <p>
                {message.text}
                {message.id === typingId ? <span className="shell-caret" aria-hidden="true" /> : null}
              </p>
            </article>
          ))
        )}
      </div>
      {extra}
      <form className="weaver-shell-form" onSubmit={submit}>
        <label className="visually-hidden" htmlFor={fieldId}>
          {mode === 'ask' ? 'Message Ask Weaver' : 'Message Weaver Scribe'}
        </label>
        <div className="weaver-shell-field">
          <textarea
            id={fieldId}
            rows={variant === 'page' ? 2 : 2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
          />
          {draft.length === 0 ? (
            <span className="weaver-shell-ghost" aria-hidden="true">
              <span className="weaver-shell-lead">{lead}</span> {ghost}
              <span className="shell-caret" />
            </span>
          ) : null}
        </div>
        <button className="weaver-shell-send" type="submit" disabled={draft.trim().length === 0 || typingId !== null}>
          Send
        </button>
      </form>
    </section>
  )
}

export default WeaverShell
