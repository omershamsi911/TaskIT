import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LandingPage from './common/LandingPage'
import HomePage from './user/pages/HomePage'
import Login from './common/Login'
import Signup from './common/Signup'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<HomePage />} path='/get-providers'/>
        <Route element={<Login />} path='/login' />
        <Route element={<Signup />} path='/signup' />
      </Routes>
    </BrowserRouter>
  )
}

export default App