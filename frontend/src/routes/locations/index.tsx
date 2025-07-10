import { createFileRoute, Link } from '@tanstack/react-router'

const fetchLocations = async () => {
  const response = await fetch('/api/locations')
  console.log(response)
  if (!response.ok) {
    throw new Error('Failed to fetch locations')
  }
  return response.json()
}

export const Route = createFileRoute('/locations/')({
  component: RouteComponent,
  loader: () => fetchLocations(),
})

function RouteComponent() {
  const locations = Route.useLoaderData()
  console.log(locations)
  return (
    <div>
      <h2>Locations</h2>
      <ul>
        {locations.map(
          (location: { id: string; name: string; shelves: Array<any> }) => (
            <Link
              key={location.id}
              to="$location"
              params={{ location: location.id }}
            >
              <li>
                {location.name} [{location.shelves.length}]
              </li>
            </Link>
          )
        )}
      </ul>
    </div>
  )
}
