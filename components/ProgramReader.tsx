'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { chapters, chapterColor, measuresByChapter } from '@/lib/poster'
import { Icon } from '@/components/pp/Icon'
import { PosterImage, ScreenHead } from '@/components/pp/primitives'
import { measures } from '@/lib/measures'
import type { Measure } from '@/types'

function MeasureRow({ m }: { m: Measure }) {
  return (
    <Link
      href={`/mesures/${m.id}`}
      className="pp-card flex items-center gap-[10px] text-left"
      style={{ padding: '9px 11px', background: '#fff', boxShadow: '2px 2px 0 #D6D5D5' }}
    >
      <span className="tag-num flex-none" style={{ width: 34, fontSize: 13, color: '#4C0297' }}>
        N°{m.id}
      </span>
      <span className="flex-1 overflow-hidden" style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, maxHeight: 33 }}>
        {m.title}
      </span>
      {m.isKeyMeasure && <Icon n="star" s={14} fill className="flex-none" style={{ color: '#4C0297' }} />}
      <Icon n="chevR" s={15} className="flex-none text-gray" />
    </Link>
  )
}

export function ProgramReader() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<number | null>(null)

  const ql = q.trim().toLowerCase()
  const filteredChapters = ql
    ? chapters.filter((c) => c.title.toLowerCase().includes(ql) || c.summary.toLowerCase().includes(ql))
    : chapters
  const hits = useMemo(
    () => (ql ? measures.filter((m) => m.title.toLowerCase().includes(ql)).slice(0, 8) : []),
    [ql],
  )

  return (
    <div className="mx-auto max-w-[440px] pb-nav">
      <ScreenHead
        eyebrow="L’Avenir en commun"
        title="Le programme"
        sub="837 mesures, 18 chapitres. Lisez, cherchez, et donnez votre avis."
      />

      <div className="pad">
        <div className="pp-card flex items-center gap-2" style={{ padding: '11px 13px', boxShadow: '3px 3px 0 #E5CBFF' }}>
          <Icon n="search" s={19} className="text-gray" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une mesure, un thème…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14.5 }}
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Effacer">
              <Icon n="x" s={16} className="text-gray" />
            </button>
          )}
        </div>
      </div>

      {ql && hits.length > 0 && (
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow text-gray" style={{ marginBottom: 9 }}>Mesures trouvées · {hits.length}</div>
          <div className="grid gap-[9px]">
            {hits.map((m) => (
              <MeasureRow key={m.id} m={m} />
            ))}
          </div>
        </div>
      )}

      <div className="pad grid gap-[13px]" style={{ marginTop: 16 }}>
        {filteredChapters.map((c) => {
          const isOpen = open === c.num
          const list = isOpen ? measuresByChapter(c.num) : []
          return (
            <div key={c.id} className="pp-card overflow-hidden" style={{ boxShadow: isOpen ? '5px 5px 0 #0C0D0E' : '4px 4px 0 #E5CBFF' }}>
              <button onClick={() => setOpen(isOpen ? null : c.num)} className="flex w-full bg-white text-left">
                <PosterImage src={c.imageUrl} height={92} className="w-[92px] flex-none" />
                <div className="min-w-0 flex-1" style={{ padding: '12px 13px' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                    <span className={'chip ' + chapterColor(c.num)} style={{ fontSize: 10, padding: '3px 8px' }}>
                      <span className="tag-num">{String(c.num).padStart(2, '0')}</span>
                    </span>
                    {c.part && (
                      <span
                        className="text-gray overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}
                      >
                        {c.part}
                      </span>
                    )}
                  </div>
                  <div className="display" style={{ fontSize: 18, lineHeight: 1.0, paddingBottom: 1 }}>{c.title}</div>
                  <div className="flex items-center gap-2" style={{ marginTop: 9 }}>
                    <span className="tag-num text-gray" style={{ fontSize: 11 }}>{c.count} mesures</span>
                    <Icon n={isOpen ? 'chevD' : 'chevR'} s={15} style={{ color: '#4C0297', marginLeft: 'auto' }} />
                  </div>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: '4px 13px 14px', borderTop: '1.5px solid #D6D5D5', background: '#FBF6EA' }}>
                  {c.summary && (
                    <p style={{ fontSize: 13, lineHeight: 1.5, margin: '12px 0 14px', color: '#212320' }}>{c.summary}</p>
                  )}
                  <div className="grid gap-[9px]">
                    {list.map((m) => (
                      <MeasureRow key={m.id} m={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
