import { notFound } from 'next/navigation'
import { getMeasureById } from '@/lib/measures'
import { MeasureDetail } from '@/components/MeasureDetail'
import { BottomNav } from '@/components/pp/BottomNav'

export const dynamic = 'force-dynamic'

export default async function MesurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const measure = getMeasureById(Number(id))
  if (!measure) notFound()

  return (
    <>
      <MeasureDetail measure={measure} />
      <BottomNav />
    </>
  )
}
