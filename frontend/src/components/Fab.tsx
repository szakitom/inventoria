import { Button } from './ui/button'
import { Plus } from 'lucide-react'

const Fab = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white shadow-lg hover:bg-blue-700 transition-colors cursor-pointer w-12 h-12 rounded-full p-0"
      style={{ cursor: 'pointer' }}
      type="button"
      onClick={onClick}
    >
      <Plus
        className="text-white"
        style={{ width: '100%', height: '100%' }}
        strokeWidth={2}
      />
    </Button>
  )
}

export default Fab
