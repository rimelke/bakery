import { Routes as RouterRoutes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'

const Routes = () => (
  <BrowserRouter>
    <RouterRoutes>
      <Route path="/" element={<Home />} />
    </RouterRoutes>
  </BrowserRouter>
)

export default Routes
