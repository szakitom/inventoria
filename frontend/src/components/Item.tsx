const Item = ({ data }: { data: { id: string; name: string } }) => {
  const handleDelete = async () => {
    alert('Not implemented yet')
  }

  return (
    <div>
      <h3>{data.name}</h3>
      <button onClick={handleDelete}>delete</button>
    </div>
  )
}
export default Item
