'use client'

import { useEffect, useState } from 'react'
import { useIdentity } from '@/context/IdentityContext'
import { useToast } from '@/components/ui/Toast'
import { Icon } from '@/components/pp/Icon'
import type { Comment, Contribution } from '@/types'

type Tab = 'discussion' | 'idees'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}

export function MeasureCommunity({ measureId }: { measureId: number }) {
  const { identity } = useIdentity()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('discussion')

  const [comments, setComments] = useState<Comment[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  const [pseudo, setPseudo] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (identity?.pseudonym) setPseudo(identity.pseudonym)
  }, [identity])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      fetch(`/api/measures/${measureId}/comments`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/contributions?measureId=${measureId}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, k]) => {
        if (!active) return
        setComments(c)
        setContributions(k)
        setLoading(false)
      })
      .catch(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [measureId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedBody = body.trim()
    const trimmedPseudo = pseudo.trim() || 'Anonyme'
    if (!trimmedBody) return
    setBusy(true)
    try {
      if (tab === 'discussion') {
        const res = await fetch(`/api/measures/${measureId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pseudonym: trimmedPseudo, body: trimmedBody, voterId: identity?.id }),
        })
        if (!res.ok) throw new Error()
        const created = (await res.json()) as Comment
        setComments((c) => [created, ...c])
        toast('Message publié', 'success')
      } else {
        const res = await fetch('/api/contributions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ measureId, pseudonym: trimmedPseudo, body: trimmedBody, voterId: identity?.id }),
        })
        if (!res.ok) throw new Error()
        const created = (await res.json()) as Contribution
        setContributions((k) => [created, ...k])
        toast('Idée envoyée - merci', 'success')
      }
      setBody('')
    } catch {
      toast("Échec de l'envoi", 'error')
    } finally {
      setBusy(false)
    }
  }

  const items = tab === 'discussion' ? comments : contributions
  const isIdees = tab === 'idees'

  return (
    <section style={{ marginTop: 26 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h3 className="display" style={{ fontSize: 20, lineHeight: 1.0 }}>
          {isIdees ? 'Boîte à idées' : 'Discussion publique'}
        </h3>
        <span className="chip lav">{items.length}</span>
      </div>

      {/* onglets */}
      <div className="flex gap-2" style={{ marginBottom: 14 }}>
        <button
          onClick={() => setTab('discussion')}
          className="chip"
          style={{ background: tab === 'discussion' ? '#0C0D0E' : '#fff', color: tab === 'discussion' ? '#fff' : '#0C0D0E' }}
        >
          <Icon n="chat" s={13} /> Discussion
        </button>
        <button
          onClick={() => setTab('idees')}
          className="chip"
          style={{ background: isIdees ? '#0C0D0E' : '#fff', color: isIdees ? '#fff' : '#0C0D0E' }}
        >
          <Icon n="spark" s={13} /> Idées
        </button>
      </div>

      {/* formulaire */}
      <form
        onSubmit={submit}
        className="pp-card"
        style={{ padding: 15, background: isIdees ? '#FDEDFF' : '#fff', boxShadow: isIdees ? '4px 4px 0 #FFD2CF' : '4px 4px 0 #E5CBFF' }}
      >
        {isIdees && (
          <div className="eyebrow" style={{ color: '#D1271C', marginBottom: 8 }}>
            Améliorer cette mesure
          </div>
        )}
        <input
          type="text"
          value={pseudo}
          maxLength={40}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Votre pseudonyme"
          className="pp-card w-full"
          style={{ padding: '10px 12px', fontSize: 13.5, fontWeight: 700, outline: 'none', marginBottom: 8, borderColor: '#0C0D0E' }}
        />
        <textarea
          value={body}
          maxLength={2000}
          rows={2}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isIdees ? 'Votre proposition d’amendement…' : 'Partagez votre point de vue, vos questions…'}
          className="pp-card w-full resize-none"
          style={{ padding: '11px 12px', fontSize: 13.5, outline: 'none', borderColor: '#0C0D0E' }}
        />
        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <span className="text-gray" style={{ fontSize: 11 }}>{body.length}/2000</span>
          <button
            type="submit"
            disabled={!body.trim() || busy}
            className={'btn btn-sm ' + (isIdees ? 'btn-red' : 'btn-violet')}
            style={{ opacity: !body.trim() || busy ? 0.5 : 1 }}
          >
            <Icon n="plus" s={15} /> {isIdees ? "Soumettre l’idée" : 'Publier'}
          </button>
        </div>
      </form>

      {/* liste */}
      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div className="grid gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray text-center" style={{ fontSize: 13, padding: '18px 0' }}>
            {isIdees ? 'Aucune idée pour le moment. Soyez le premier à contribuer.' : 'Aucun message pour le moment. Lancez la discussion.'}
          </p>
        ) : (
          <div className="grid gap-[11px]">
            {items.map((item) => (
              <div key={item.id} className="pp-card" style={{ padding: '12px 13px', boxShadow: '2px 2px 0 #D6D5D5' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{item.pseudonym}</span>
                  <span className="text-gray" style={{ fontSize: 11 }}>{timeAgo(item.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words" style={{ fontSize: 13.5, lineHeight: 1.45, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
