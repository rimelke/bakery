import { Routes as RouterRoutes, Route } from 'react-router-dom'
import Balance from './pages/Balance'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Products from './pages/Products'

const Routes = () => (
  <RouterRoutes>
    <Route path="/" element={<Home />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/products" element={<Products />} />
    <Route path="/balance" element={<Balance />} />
  </RouterRoutes>
)

export default Routes
