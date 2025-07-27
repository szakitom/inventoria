import { Link } from '@tanstack/react-router'
import type { Location as LocationType } from './LocationSelect'

const Location = ({ location }: { location: LocationType }) => {
  return (
    <Link
      key={location.id}
      to="/locations/$location"
      params={{ location: location.id }}
    >
      {location.name} [{location.shelves.length}]
    </Link>
  )
}

export default Location
