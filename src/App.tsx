import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import { registerAllAlgorithms } from './algorithms';

function App() {
  // Register all algorithms on mount
  useEffect(() => {
    registerAllAlgorithms();
  }, []);

  return (
    <BrowserRouter basename="/AlgoVisuals">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo/:algoId" element={<DemoPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
