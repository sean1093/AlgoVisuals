import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import SiteLayout from './components/layout/SiteLayout';
import { registerAllAlgorithms } from './algorithms';
import { I18nProvider } from './i18n';

// Register all algorithms at module level
registerAllAlgorithms();

function App() {
  return (
    <I18nProvider>
      <BrowserRouter basename="/AlgoVisuals">
        <SiteLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo/:algoId" element={<DemoPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </SiteLayout>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App
