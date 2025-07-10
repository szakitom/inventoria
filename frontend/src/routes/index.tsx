import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <nav>
        <li>
          <Link to="/locations">Locations</Link>
        </li>
        <li>
          <Link to="/items/add">Add Item</Link>
        </li>
      </nav>
    </div>
  )
}
