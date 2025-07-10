import { createFileRoute, Link } from '@tanstack/react-router'

const fetchLocation = async (locationId: string) => {
  const response = await fetch(`/api/locations/${locationId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch location')
  }
  return response.json()
}

export const Route = createFileRoute('/locations/$location/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const location = await fetchLocation(params.location)
    return location
  },
})

function RouteComponent() {
  const location = Route.useLoaderData()
  return (
    <div>
      <h2>{location.name}</h2>
      {location.shelves && location.shelves.length > 0 ? (
        <ul>
          {location.shelves.map((shelf: { id: string; name: string }) => (
            <Link key={shelf.id} to="$shelf" params={{ shelf: shelf.id }}>
              <li>
                {shelf.name} [{shelf.items ? shelf.items.length : 0}]
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No shelves found for this location.</p>
      )}
    </div>
  )
}
