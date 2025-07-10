import { createFileRoute, Link } from '@tanstack/react-router'
import Item from '../../../components/Item'

export const Route = createFileRoute('/locations/$location/$shelf')({
  component: RouteComponent,
  loader: async ({ params }) => {
    // Here you would typically fetch data based on the location and shelf
    // For example:
    const response = await fetch(
      `/api/locations/${params.location}/${params.shelf}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch shelf data')
    }
    return response.json()
  },
})

function RouteComponent() {
  const shelf = Route.useLoaderData()
  const { location } = Route.useParams()

  return (
    <div>
      <h2>
        {shelf.location.name}: {shelf.name}
      </h2>
      <Link to="/locations/$location" params={{ location: location }}>
        Back to Location
      </Link>
      {shelf.items && shelf.items.length > 0 ? (
        <ul>
          {shelf.items.map((item: { id: string; name: string }) => (
            <li key={item.id}>
              <Item data={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found on this shelf.</p>
      )}
    </div>
  )
}
