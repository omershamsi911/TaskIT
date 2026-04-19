import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LandingPage from './common/LandingPage'
import HomePage from './user/pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<HomePage />} path='/get-providers'/>
      </Routes>
    </BrowserRouter>
  )
}

export default App