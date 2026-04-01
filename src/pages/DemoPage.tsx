import { useParams, Navigate, Link } from 'react-router-dom';
import { Home, ChevronRight, Layers } from 'lucide-react';
import { getAlgorithm } from '../registry';

function DemoPage() {
  const { algoId } = useParams<{ algoId: string }>();

  if (!algoId) {
    return <Navigate to="/" replace />;
  }

  const algorithm = getAlgorithm(algoId);

  if (!algorithm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Algorithm Not Found</h1>
          <p className="text-gray-600">Cannot find algorithm with ID &quot;{algoId}&quot;</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const AlgorithmComponent = algorithm.component;
  const Icon = algorithm.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* B2B Dashboard Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Breadcrumb */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Layers size={20} className="text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900 hidden sm:block">Algorithm Canvas</span>
              </Link>

              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center gap-2 text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-900">
                  Home
                </Link>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {algorithm.name} Dashboard
                </span>
              </nav>
            </div>

            {/* Algorithm Info Badge */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Active Algorithm</div>
                <div className="text-sm font-semibold text-gray-900">{algorithm.name}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
        <div className="max-w-[1800px] mx-auto">
          {/* Page Title & Description */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {algorithm.name} Visualization Dashboard
            </h1>
            <p className="text-gray-600">{algorithm.description}</p>
          </div>

          {/* Visualizer Component */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <AlgorithmComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DemoPage;
