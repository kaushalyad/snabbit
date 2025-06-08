import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Reports from './components/reports/Reports';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/environments" element={<div>Environments Page</div>} />
          <Route path="/executions" element={<div>Executions Page</div>} />
          <Route path="/configuration" element={<div>Configuration Page</div>} />
          <Route path="/administration" element={<div>Administration Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
