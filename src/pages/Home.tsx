import { useEffect } from 'react'

const Home = () => {
  useEffect(() => {
    console.log('useEffect')
  }, [])

  return (
    <div>
      <p>sla</p>
    </div>
  )
}

export default Home
