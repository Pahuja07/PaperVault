import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Papers from './pages/Papers/Papers'
import Subjects from './pages/Subjects/Subjects'
import Upload from './pages/Upload/Upload'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import AIPredictions from './pages/AIPredictions/AIPredictions'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/predictions" element={<AIPredictions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
