import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import { registerAllAlgorithms } from './algorithms';

// Register all algorithms at module level
registerAllAlgorithms();

function App() {
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
