import { createFileRoute } from '@tanstack/react-router'
import Simple from '../../Simple'

export const Route = createFileRoute('/items/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Simple />
}
