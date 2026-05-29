import { program } from '@/lib/measures'
import { ProgramReader } from '@/components/ProgramReader'

export default function ProgrammePage() {
  return <ProgramReader program={program} />
}
