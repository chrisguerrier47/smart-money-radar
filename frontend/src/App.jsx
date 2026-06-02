import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TickerDetail from './pages/TickerDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/ticker/:ticker" element={<TickerDetail />} />
    </Routes>
  )
}
