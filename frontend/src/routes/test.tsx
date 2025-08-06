import { createFileRoute } from '@tanstack/react-router'
import TesseractDemo from '@/TesseractDemo'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TesseractDemo />
}
