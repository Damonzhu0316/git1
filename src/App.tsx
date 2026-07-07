import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import IndexPage from '@/pages/IndexPage';
import HeliocentricPage from '@/pages/HeliocentricPage';
import GeocentricPage from '@/pages/GeocentricPage';
import SurfacePage from '@/pages/SurfacePage';
import PageTransition from '@/components/UI/PageTransition';
import ToastContainer from '@/components/UI/Toast';
import GlobalSearch from '@/components/UI/GlobalSearch';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<IndexPage />} />
        <Route path="/heliocentric" element={<HeliocentricPage />} />
        <Route path="/geocentric" element={<GeocentricPage />} />
        <Route path="/surface" element={<SurfacePage />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
      <ToastContainer />
      <GlobalSearch />
    </Router>
  );
}