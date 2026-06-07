import { measures } from '@/lib/measures'
import { SwipeDeck } from '@/components/SwipeDeck'
import { BottomNav } from '@/components/pp/BottomNav'

export default function SwipePage() {
  return (
    <>
      <SwipeDeck measures={measures} />
      <BottomNav />
    </>
  )
}
