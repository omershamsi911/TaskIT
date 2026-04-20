import {BrowserRouter, Routes, Route} from 'react-router-dom'
import HomePage from './user/pages/HomePage'
import Login from './common/pages/Login'
import Signup from './common/pages/Signup'
import LandingPage from './common/pages/LandingPage'
import DiscoveryPage from './user/pages/DiscoveryPage'
import ProfilePage from './provider/pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<DiscoveryPage />} />
        <Route path="/get-providers" element={<HomePage />} />
        <Route path="/login" element={<Login />}  />
        <Route path="/signup" element={<Signup />}  />
        <Route path="/user/profile" element={<ProfilePage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App