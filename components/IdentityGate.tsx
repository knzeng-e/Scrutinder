'use client'

import { useState } from 'react'
import { useIdentity } from '@/context/IdentityContext'
import { Icon, type IconName } from '@/components/pp/Icon'

const SUGGESTIONS = ['CitoyenÉveillé', 'VoixDuPeuple', 'Constituante', 'MarcheuseÉco', 'SansFiltre']

const ARGS: [IconName, string][] = [
  ['shield', 'Votre voix reste locale et protégée'],
  ['hash', 'Comptage public et vérifiable'],
  ['spark', '15 214 contributions citoyennes'],
]

function PosterBand() {
  return (
    <div className="relative overflow-hidden border-b-2 border-ink bg-violet text-white" style={{ padding: '26px 22px 22px' }}>
      <div className="absolute rounded-full bg-red" style={{ right: -30, top: -30, width: 150, height: 150, opacity: 0.9 }} />
      <div className="absolute rounded-full bg-lavender" style={{ right: 24, bottom: -18, width: 64, height: 64 }} />
      <div className="eyebrow relative" style={{ color: '#E5CBFF' }}>
        L’Avenir en commun · 2027
      </div>
      <h1 className="display relative" style={{ fontSize: 44, marginTop: 8, textShadow: '3px 3px 0 #A81910', lineHeight: 0.92 }}>
        Parlement
        <br />
        Populaire
      </h1>
    </div>
  )
}

export function IdentityGate() {
  const {
    status,
    error,
    isBusy,
    isSupported,
    needsRecovery,
    createAccount,
    unlock,
    recreatePasskey,
    continueAsGuest,
    clearError,
  } = useIdentity()

  const isLocked = status === 'locked'
  const [step, setStep] = useState(0)
  const [pseudo, setPseudo] = useState('')

  // ── Écran verrouillé / récupération ─────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col bg-paper">
        <PosterBand />
        <div className="flex flex-1 flex-col justify-center" style={{ padding: '24px 22px' }}>
          <div className="flex justify-center" style={{ margin: '6px 0 24px' }}>
            <div
              className="flex items-center justify-center border-2 border-ink"
              style={{ width: 110, height: 110, borderRadius: 28, background: '#E5CBFF', boxShadow: '6px 6px 0 #4C0297', color: '#37016E' }}
            >
              <Icon n={needsRecovery ? 'shield' : 'lock'} s={56} sw={1.8} />
            </div>
          </div>
          <h2 className="display text-center" style={{ fontSize: 30 }}>
            {needsRecovery ? 'Récupérer\nl’accès' : 'Espace\nverrouillé'}
          </h2>
          <p className="text-center" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 12, color: '#212320', fontWeight: 600 }}>
            {needsRecovery
              ? 'Votre passkey n’est plus reconnue. Recréez-la - votre historique chiffré est conservé.'
              : 'Utilisez votre passkey pour retrouver vos votes chiffrés.'}
          </p>

          {error && !needsRecovery && (
            <div className="pp-card" style={{ marginTop: 16, padding: '11px 13px', background: '#FFD2CF', borderColor: '#D1271C' }}>
              <p style={{ fontSize: 13, color: '#A81910', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            disabled={!isSupported || isBusy}
            onClick={needsRecovery ? recreatePasskey : unlock}
            className="btn btn-violet btn-block"
            style={{ marginTop: 22, opacity: !isSupported || isBusy ? 0.5 : 1 }}
          >
            {isBusy ? 'Veuillez patienter…' : needsRecovery ? 'Recréer ma passkey' : 'Déverrouiller avec passkey'}
            {!isBusy && <Icon n="arrowR" s={18} />}
          </button>

          {!needsRecovery && (
            <button
              disabled={isBusy}
              onClick={recreatePasskey}
              className="cond"
              style={{ display: 'block', margin: '14px auto 0', color: '#706F6F', fontWeight: 600, fontSize: 13 }}
            >
              Problème de connexion ? Recréer la passkey
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Onboarding 3 étapes ─────────────────────────────────────────────────────
  const Dots = () => (
    <div className="flex justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: i === step ? 22 : 8,
            height: 8,
            borderRadius: 99,
            background: i === step ? '#4C0297' : '#D6D5D5',
            transition: 'width .25s',
          }}
        />
      ))}
    </div>
  )

  function next() {
    if (step < 2) {
      if (step === 1 && !pseudo) setPseudo('VoixDuPeuple')
      setStep(step + 1)
    } else {
      createAccount(pseudo || 'VoixDuPeuple')
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col bg-paper">
      <PosterBand />

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 22px' }}>
        {step === 0 && (
          <div className="animate-pop">
            <h2 className="display" style={{ fontSize: 30, lineHeight: 0.95 }}>
              Votez les mesures.
              <br />
              <span style={{ color: '#D1271C' }}>
                Mesurez l’adhésion
                <br />
                populaire.
              </span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.5, marginTop: 16, color: '#212320' }}>
              837 mesures du programme, soumises au vote citoyen. Swipez, débattez, contribuez - et voyez en direct ce que le
              peuple priorise.
            </p>
            <div className="grid gap-3" style={{ marginTop: 20 }}>
              {ARGS.map(([ic, tx]) => (
                <div key={ic} className="flex items-center gap-3">
                  <div
                    className="flex flex-none items-center justify-center border-[1.5px] border-ink bg-lavender"
                    style={{ width: 42, height: 42, borderRadius: 11 }}
                  >
                    <Icon n={ic} s={20} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{tx}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-pop">
            <div className="eyebrow" style={{ color: '#4C0297' }}>
              Étape 1 · Identité locale
            </div>
            <h2 className="display" style={{ fontSize: 30, marginTop: 8 }}>
              Choisissez
              <br />
              un pseudonyme
            </h2>
            <p className="text-gray" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 10 }}>
              Aucun e-mail, aucun compte. Votre pseudonyme reste sur cet appareil.
            </p>
            <input
              value={pseudo}
              maxLength={32}
              onChange={(e) => { setPseudo(e.target.value); clearError() }}
              placeholder="ex. VoixDuPeuple"
              className="pp-card w-full"
              style={{ marginTop: 18, padding: '15px 16px', fontSize: 17, fontWeight: 700, outline: 'none', boxShadow: '4px 4px 0 #E5CBFF' }}
            />
            <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setPseudo(s)} className="chip">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-pop text-center">
            <div className="eyebrow" style={{ color: '#4C0297' }}>
              Étape 2 · Sécurité
            </div>
            <h2 className="display" style={{ fontSize: 30, marginTop: 8 }}>
              Verrouillez
              <br />
              avec une passkey
            </h2>
            <div className="flex justify-center" style={{ margin: '26px 0' }}>
              <div
                className="flex items-center justify-center border-2 border-ink"
                style={{ width: 120, height: 120, borderRadius: 30, background: '#E5CBFF', boxShadow: '6px 6px 0 #4C0297', color: '#37016E' }}
              >
                <Icon n="finger" s={62} sw={1.8} />
              </div>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, maxWidth: 280, margin: '0 auto', fontWeight: 600 }}>
              Vos votes sont chiffrés sur votre appareil avec votre empreinte ou votre code.
            </p>
            <p className="text-gray" style={{ fontSize: 12.5, marginTop: 12 }}>
              Identifiant&nbsp;: <b style={{ color: '#4C0297' }}>sc_…</b> (généré localement)
            </p>
            {!isSupported && (
              <div className="pp-card" style={{ marginTop: 14, padding: '11px 13px', background: '#FFD2CF', borderColor: '#D1271C', textAlign: 'left' }}>
                <p style={{ fontSize: 12.5, color: '#A81910', margin: 0 }}>
                  Les passkeys nécessitent HTTPS ou localhost avec un navigateur récent.
                </p>
              </div>
            )}
            {error && (
              <div className="pp-card" style={{ marginTop: 14, padding: '11px 13px', background: '#FFD2CF', borderColor: '#D1271C', textAlign: 'left' }}>
                <p style={{ fontSize: 12.5, color: '#A81910', margin: 0 }}>{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 22px 22px', borderTop: '1.5px solid #D6D5D5', background: '#FFFCF4' }}>
        <Dots />
        <button
          className="btn btn-violet btn-block"
          style={{ marginTop: 16, opacity: step === 2 && (!isSupported || isBusy) ? 0.5 : 1 }}
          disabled={step === 2 && (!isSupported || isBusy)}
          onClick={next}
        >
          {isBusy ? 'Veuillez patienter…' : step === 0 ? 'Créer mon identité' : step === 1 ? 'Continuer' : 'Activer la passkey & entrer'}
          {!isBusy && <Icon n="arrowR" s={18} />}
        </button>
        {step === 0 && (
          <button
            onClick={continueAsGuest}
            className="cond"
            style={{ display: 'block', margin: '12px auto 0', color: '#706F6F', fontWeight: 600, fontSize: 13 }}
          >
            Explorer sans identité
          </button>
        )}
      </div>
    </div>
  )
}
