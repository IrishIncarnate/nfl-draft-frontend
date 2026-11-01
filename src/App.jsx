import { Routes, Route, Navigate } from 'react-router-dom'
import AppHeader from './components/AppHeader/AppHeader'
import Prospects from './pages/Prospects'
import BigBoard from './pages/BigBoard'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-body">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/board" element={<BigBoard />} />
            <Route path="/prospects" element={<Prospects />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
