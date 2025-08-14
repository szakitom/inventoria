import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const SaveButton = ({ onClick }: { onClick: () => Promise<void> }) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await onClick()
    setLoading(false)
  }

  return (
    <Button
      size="icon"
      variant="secondary"
      className="cursor-pointer bg-sky-500 text-white hover:bg-sky-600"
      onClick={handleClick}
    >
      {loading ? <Spinner isPending={loading} /> : <Save />}
    </Button>
  )
}

export default SaveButton
