const Item = ({ data }: { data: { id: string; name: string } }) => {
  const handleDelete = async () => {
    const response = await fetch(`/api/items/${data.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      alert('Failed to delete item')
      return
    }
    // tanstack router will automatically refresh the page
    // or you can use a state management solution to remove the item from the list
    alert('Item deleted successfully')
  }

  const handleApprove = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      await handleDelete()
    }
  }

  console.log(data)

  return (
    <div>
      <h3>{data.name}</h3>
      <ul>
        <li>
          {data.amount} x {data.quantity || 'db'}
        </li>
        {data.expiration && (
          <>
            <li>
              Expiration: {new Date(data.expiration).toLocaleDateString()}
            </li>
            <li>Expires in: {data.expiresIn} days</li>
          </>
        )}
      </ul>
      {data.amount === 1 && <button onClick={handleApprove}>delete</button>}
    </div>
  )
}
export default Item
