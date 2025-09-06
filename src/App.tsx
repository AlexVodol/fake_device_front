import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DevicesPage from '@/pages/DevicesPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/devices/regula" replace />} />
        <Route path="devices">
          <Route index element={<Navigate to="regula" replace />} />
          <Route path="regula" element={<DevicesPage />} />
          <Route path="rfid" element={<DevicesPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
