import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAlgorithm } from '../registry';

function DemoPage() {
  const { algoId } = useParams<{ algoId: string }>();

  if (!algoId) {
    return <Navigate to="/" replace />;
  }

  const algorithm = getAlgorithm(algoId);

  if (!algorithm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Algorithm Not Found</h1>
          <p className="text-lg text-gray-600">Cannot find algorithm "{algoId}"</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const AlgorithmComponent = algorithm.component;
  const Icon = algorithm.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="pt-8 md:pt-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 md:mb-12 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-sm mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{algorithm.name}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-4 md:mb-6 leading-tight px-4">
              {algorithm.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed px-4">
              {algorithm.description}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <AlgorithmComponent />
        </div>
      </main>
    </div>
  );
}

export default DemoPage;
