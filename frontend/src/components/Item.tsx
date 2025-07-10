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

  const handleIncrease = async () => {
    const response = await fetch(`/api/items/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: data.amount + 1 }),
    })
    if (!response.ok) {
      alert('Failed to increase item amount')
      return
    }
    alert('Item amount increased successfully')
  }

  const handleDecrease = async () => {
    if (data.amount <= 0) {
      alert('Amount cannot be less than 0')
      return
    }
    const response = await fetch(`/api/items/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: data.amount - 1 }),
    })
    if (!response.ok) {
      alert('Failed to decrease item amount')
      return
    }
    alert('Item amount decreased successfully')
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
      <>
        <button onClick={handleDecrease}>-</button>
        <span>{data.amount}</span>
        <button onClick={handleIncrease}>+</button>
      </>
      <button onClick={handleApprove}>delete</button>
    </div>
  )
}
export default Item
