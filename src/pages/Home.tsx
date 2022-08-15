import { useEffect } from 'react'
import api from '../services/api'

const Home = () => {
  useEffect(() => {
    const main = async () => {
      const products = await api.getProducts()

      console.log('products', products)
    }

    main()
  }, [])

  return (
    <div>
      <p>sla</p>
    </div>
  )
}

export default Home
