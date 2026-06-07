'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useIdentity } from '@/context/IdentityContext'
import { useVotes } from '@/context/VotesContext'
import { getMeasureById } from '@/lib/measures'
import { Icon, type IconName } from '@/components/pp/Icon'
import { ScreenHead, BigStat } from '@/components/pp/primitives'
import { VOTES } from '@/components/pp/votes'
import { useToast } from '@/components/ui/Toast'

export function Compte() {
  const { identity, status, guest, logout, deleteProfile } = useIdentity()
  const { votes } = useVotes()
  const { toast } = useToast()
  const router = useRouter()

  const history = useMemo(() => {
    return Object.keys(votes)
      .map(Number)
      .map((id) => {
        const m = getMeasureById(id)
        return m ? { m, choice: votes[id] } : null
      })
      .filter((x): x is { m: NonNullable<ReturnType<typeof getMeasureById>>; choice: (typeof votes)[number] } => x !== null)
      .reverse()
  }, [votes])

  const votedIds = Object.keys(votes).map(Number)
  const priorities = votedIds.filter((id) => votes[id] === 'prioritaire').length

  function handleDelete() {
    if (!window.confirm('Supprimer cette identité, la passkey et tous les votes enregistrés sur cet appareil ?')) return
    deleteProfile()
    router.push('/')
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ pseudonym: identity?.pseudonym, id: identity?.id, votes }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parlement-populaire-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('Données exportées', 'success')
  }

  // Mode invité (sans identité) : inviter à en créer une.
  if (!identity && (guest || status !== 'ready')) {
    return (
      <div className="mx-auto max-w-[440px] pb-nav">
        <ScreenHead eyebrow="Votre identité locale" title="Compte" />
        <div className="pad">
          <div className="pp-card" style={{ padding: 18, boxShadow: '5px 5px 0 #E5CBFF' }}>
            <h3 className="display" style={{ fontSize: 22 }}>Aucune identité</h3>
            <p className="text-gray" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>
              Vous explorez sans identité locale. Créez-en une pour chiffrer et retrouver vos votes sur cet appareil.
            </p>
            <Link href="/" className="btn btn-violet btn-block" style={{ marginTop: 16 }}>
              <Icon n="finger" s={18} /> Créer mon identité
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[440px] pb-nav">
      <ScreenHead eyebrow="Votre identité locale" title="Compte" />

      {/* carte identité */}
      <div className="pad">
        <div className="pp-card relative overflow-hidden" style={{ padding: 18, boxShadow: '5px 5px 0 #E5CBFF' }}>
          <div className="absolute rounded-full bg-lavender" style={{ right: -24, top: -24, width: 96, height: 96, opacity: 0.6 }} />
          <div className="relative flex items-center gap-3">
            <div
              className="flex items-center justify-center border-2 border-ink bg-violet text-white"
              style={{ width: 58, height: 58, borderRadius: 16, boxShadow: '3px 3px 0 #0C0D0E' }}
            >
              <Icon n="user" s={30} />
            </div>
            <div className="flex-1">
              <div className="display" style={{ fontSize: 24 }}>{identity?.pseudonym}</div>
              <div className="tag-num text-gray break-all" style={{ fontSize: 11.5 }}>
                {identity?.id?.slice(0, 18)}…
              </div>
            </div>
          </div>
          <div className="relative flex gap-2" style={{ marginTop: 14 }}>
            <span className="chip green">
              <Icon n="shield" s={13} /> Passkey active
            </span>
            <span className="chip lav">
              <Icon n="lock" s={13} /> Chiffré local
            </span>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="pad" style={{ marginTop: 14 }}>
        <div className="flex gap-[10px]">
          <BigStat n={votedIds.length} l="votes exprimés" c="violet" />
          <BigStat n={Math.max(votedIds.length ? 1 : 0, Math.ceil(votedIds.length / 8))} l="sessions" c="green" />
          <BigStat n={priorities} l="priorités" c="blue" />
        </div>
      </div>

      {/* historique */}
      <div className="pad" style={{ margin: '22px 0 12px' }}>
        <div className="eyebrow text-gray" style={{ marginBottom: 3 }}>Sur cet appareil</div>
        <h3 className="display" style={{ fontSize: 24, lineHeight: 1.0 }}>Historique de votes</h3>
      </div>
      <div className="pad grid gap-[9px]">
        {history.length === 0 ? (
          <div className="pp-card text-center text-gray" style={{ padding: '22px 16px' }}>
            <Icon n="cards" s={30} className="mx-auto" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>Aucun vote pour l’instant.</p>
            <Link href="/swipe" className="btn btn-violet btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>
              Voter les mesures
            </Link>
          </div>
        ) : (
          history.map(({ m, choice }) => {
            const v = VOTES[choice]
            return (
              <Link
                key={m.id}
                href={`/mesures/${m.id}`}
                className="pp-card flex items-center gap-[10px] text-left"
                style={{ padding: '9px 11px', boxShadow: '2px 2px 0 #D6D5D5' }}
              >
                <span
                  className="flex flex-none items-center justify-center border-[1.5px] border-ink"
                  style={{ width: 34, height: 34, borderRadius: 9, background: v.bg, color: v.color }}
                >
                  <Icon n={v.icon} s={17} fill={choice === 'pour' || choice === 'prioritaire'} />
                </span>
                <div className="min-w-0 flex-1">
                  <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, maxHeight: 33, overflow: 'hidden' }}>{m.title}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: v.color, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    {v.label}
                  </div>
                </div>
                <Icon n="chevR" s={15} className="flex-none text-gray" />
              </Link>
            )
          })
        )}
      </div>

      {/* confidentialité */}
      <div className="pad" style={{ margin: '22px 0 12px' }}>
        <div className="eyebrow text-gray" style={{ marginBottom: 3 }}>Votre voix vous appartient</div>
        <h3 className="display" style={{ fontSize: 24, lineHeight: 1.0 }}>Confidentialité</h3>
      </div>
      <div className="pad grid gap-[10px]">
        {([
          ['lock', 'Verrouiller l’application', 'Exiger la passkey à l’ouverture', logout],
          ['copy', 'Exporter mes données', 'Sauvegarde chiffrée locale', exportData],
        ] as [IconName, string, string, () => void][]).map(([ic, t, sub, action]) => (
          <button key={t} onClick={action} className="pp-card flex items-center gap-3 text-left" style={{ padding: '13px 14px', boxShadow: '2px 2px 0 #D6D5D5' }}>
            <div
              className="flex flex-none items-center justify-center border-[1.5px] border-ink bg-paper2"
              style={{ width: 38, height: 38, borderRadius: 11 }}
            >
              <Icon n={ic} s={18} />
            </div>
            <div className="flex-1">
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>{t}</div>
              <div className="text-gray" style={{ fontSize: 11.5 }}>{sub}</div>
            </div>
            <Icon n="chevR" s={16} className="text-gray" />
          </button>
        ))}

        <button
          onClick={handleDelete}
          className="pp-card flex items-center gap-3 text-left"
          style={{ padding: '13px 14px', borderColor: '#D1271C', boxShadow: '2px 2px 0 #FFD2CF' }}
        >
          <div
            className="flex flex-none items-center justify-center border-[1.5px]"
            style={{ width: 38, height: 38, borderRadius: 11, background: '#FFD2CF', borderColor: '#D1271C', color: '#D1271C' }}
          >
            <Icon n="trash" s={18} />
          </div>
          <div className="flex-1">
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#D1271C' }}>Supprimer mon identité</div>
            <div className="text-gray" style={{ fontSize: 11.5 }}>Efface tout, localement et définitivement</div>
          </div>
        </button>
      </div>
    </div>
  )
}
