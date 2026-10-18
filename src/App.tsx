import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import SiteLayout from './components/layout/SiteLayout';
import { registerAllAlgorithms } from './algorithms';

// Register all algorithms at module level
registerAllAlgorithms();

function App() {
  return (
    <BrowserRouter basename="/AlgoVisuals">
      <SiteLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo/:algoId" element={<DemoPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default App
