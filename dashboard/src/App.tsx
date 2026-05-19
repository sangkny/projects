import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'

import './App.css'
import AutoNoGaDa from './pages/AutoNoGaDa'
import CoOps from './pages/CoOps'
import HarnessPage from './pages/Harness'
import MediIOT from './pages/MediIOT'
import OntologyMonitor from './pages/OntologyMonitor'
import Overview from './pages/Overview'

function NavBar() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navlink active' : 'navlink'

  return (
    <nav className="topnav">
      <span className="brand">MEDIIOT 통합 대시보드</span>
      <NavLink to="/" end className={linkCls}>
        Overview
      </NavLink>
      <NavLink to="/ontology" className={linkCls}>
        OntologyMonitor
      </NavLink>
      <NavLink to="/harness" className={linkCls}>
        Harness
      </NavLink>
      <NavLink to="/medi" className={linkCls}>
        MEDI-IOT
      </NavLink>
      <NavLink to="/autonogada" className={linkCls}>
        AutoNoGaDa
      </NavLink>
      <NavLink to="/coops" className={linkCls}>
        CoOps
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/dashboard">
      <div className="app-shell">
        <header className="app-header">
          <NavBar />
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/ontology" element={<OntologyMonitor />} />
            <Route path="/harness" element={<HarnessPage />} />
            <Route path="/medi" element={<MediIOT />} />
            <Route path="/autonogada" element={<AutoNoGaDa />} />
            <Route path="/coops" element={<CoOps />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
