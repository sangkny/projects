import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from './app/admin/layout'
import AdminAuditPage from './app/admin/audit/page'
import AdminModelsPage from './app/admin/models/page'
import AdminOntologyPage from './app/admin/ontology/page'
import AdminPerformancePage from './app/admin/performance/page'
import InternalLayout from './app/internal/layout'
import PortalLayout from './app/portal/layout'
import BillingPage from './app/portal/billing/page'
import FundusResultsPage from './app/portal/fundus/results/page'
import FundusUploadPage from './app/portal/fundus/upload/page'
import ReviewsPage from './app/portal/reviews/page'
import './App.css'
import { AlertProvider } from './components/shared/ImmediateAlertHost'
import AutoNoGaDa from './pages/AutoNoGaDa'
import CoOps from './pages/CoOps'
import HarnessPage from './pages/Harness'
import MediIOT from './pages/MediIOT'
import OntologyMonitor from './pages/OntologyMonitor'
import Overview from './pages/Overview'

export default function App() {
  return (
    <AlertProvider>
    <BrowserRouter basename="/dashboard">
      <Routes>
        <Route path="/" element={<Navigate to="/portal/fundus/upload" replace />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="fundus/upload" replace />} />
          <Route path="fundus/upload" element={<FundusUploadPage />} />
          <Route path="fundus/results" element={<FundusResultsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="models" replace />} />
          <Route path="models" element={<AdminModelsPage />} />
          <Route path="performance" element={<AdminPerformancePage />} />
          <Route path="audit" element={<AdminAuditPage />} />
          <Route path="ontology" element={<AdminOntologyPage />} />
        </Route>
        <Route path="/internal" element={<InternalLayout />}>
          <Route index element={<Overview />} />
          <Route path="ontology" element={<OntologyMonitor />} />
          <Route path="harness" element={<HarnessPage />} />
          <Route path="medi" element={<MediIOT />} />
          <Route path="autonogada" element={<AutoNoGaDa />} />
          <Route path="coops" element={<CoOps />} />
        </Route>
        <Route path="/ontology" element={<Navigate to="/internal/ontology" replace />} />
        <Route path="/harness" element={<Navigate to="/internal/harness" replace />} />
        <Route path="/medi" element={<Navigate to="/internal/medi" replace />} />
        <Route path="/autonogada" element={<Navigate to="/internal/autonogada" replace />} />
        <Route path="/coops" element={<Navigate to="/internal/coops" replace />} />
      </Routes>
    </BrowserRouter>
    </AlertProvider>
  )
}
