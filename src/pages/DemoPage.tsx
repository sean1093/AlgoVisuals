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
      <div className="min-h-screen bg-warmWhite flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Algorithm Not Found</h1>
          <p className="text-gray-600 mb-8">Cannot find algorithm with ID &quot;{algoId}&quot;</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pastelBlue rounded-xl hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const AlgorithmComponent = algorithm.component;

  return (
    <div className="min-h-screen bg-warmWhite">
      {/* Header */}
      <div className="border-b-2 border-borderGray bg-white shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </Link>
              <div className="h-8 w-px bg-borderGray"></div>
              <h1 className="text-2xl font-bold">{algorithm.name}</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2 ml-24">{algorithm.description}</p>
        </div>
      </div>

      {/* Visualizer */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border-2 border-borderGray shadow-soft-md p-6 min-h-[600px]">
          <AlgorithmComponent />
        </div>
      </div>
    </div>
  );
}

export default DemoPage;
