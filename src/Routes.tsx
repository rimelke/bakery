import { Routes as RouterRoutes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Orders from './pages/Orders'

const Routes = () => (
  <RouterRoutes>
    <Route path="/" element={<Home />} />
    <Route path="/orders" element={<Orders />} />
  </RouterRoutes>
)

export default Routes
