import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './presentation/components/layout/Layout';
import { HomePage } from './presentation/pages/HomePage';
import { LeadsPage } from './presentation/pages/LeadsPage';
import { OpportunitiesPage } from './presentation/pages/OpportunitiesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;