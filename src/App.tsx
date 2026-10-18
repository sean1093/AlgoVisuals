import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import SiteLayout from './components/layout/SiteLayout';
import { registerAllAlgorithms } from './algorithms';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './theme';

// Register all algorithms at module level
registerAllAlgorithms();

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App
