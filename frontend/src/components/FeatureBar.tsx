import { useLoaderData } from '@tanstack/react-router'

interface FeatureBarProps {
  from: '/' | '/locations/$location/'
}
// TODO: display soon expiring items in a marquee
const FeatureBar = ({ from }: FeatureBarProps) => {
  const data = useLoaderData({ from })
  console.log('FeatureBar data:', data)

  return null
}

export default FeatureBar
