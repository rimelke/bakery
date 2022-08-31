import { Routes as RouterRoutes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Products from './pages/Products'

const Routes = () => (
  <RouterRoutes>
    <Route path="/" element={<Home />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/products" element={<Products />} />
  </RouterRoutes>
)

export default Routes
