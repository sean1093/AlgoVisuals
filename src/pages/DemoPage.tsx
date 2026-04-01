import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-semibold text-gray-900">Not Found</h1>
          <p className="text-xl text-gray-600 font-light">Cannot find algorithm with ID &quot;{algoId}&quot;</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:gap-3 transition-all duration-300 text-lg font-medium mt-8"
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
    <div className="min-h-screen bg-white">
      {/* Sticky Header - Apple Style */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">{algorithm.name}</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </motion.header>

      {/* Visualizer */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <AlgorithmComponent />
      </motion.main>
    </div>
  );
}

export default DemoPage;
