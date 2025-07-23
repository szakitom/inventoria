import { getRouteApi } from '@tanstack/react-router'

interface Item {
  id: string
  name: string
  location: {
    location: {
      name: string
    }
    name: string
  }
  barcode: string
  quantity?: string | number
  expiration?: string
  createdAt: string
  expiresIn?: string
  amount?: string | number
}

const route = getRouteApi('/')

const Items = () => {
  const {
    items: { items },
  } = route.useLoaderData()

  console.log(items)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item: Item) => (
        <div key={item.id} className="p-4 border-b">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600">
            Location: {item.location.location.name}
          </p>
          <p className="text-sm text-gray-600">Shelf: {item.location.name}</p>
          <p className="text-sm text-gray-600">Barcode: {item.barcode}</p>
          <p className="text-sm text-gray-600">
            Quantity: {item.quantity || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            Expiration: {item.expiration || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            Created At: {new Date(item.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Expires In: {item.expiresIn || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            Amount: {item.amount || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">ID: {item.id}</p>
        </div>
      ))}
    </div>
  )
}

export default Items
