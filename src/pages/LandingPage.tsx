import { useNavigate } from 'react-router-dom';
import { getAllAlgorithms } from '../registry';
import { ArrowRight, BarChart3, GitBranch, Layers } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const algorithms = getAllAlgorithms();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Algorithm Canvas</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#algorithms" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Algorithms
            </a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section - B2B Professional */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <BarChart3 size={16} />
              Interactive Visualization Platform
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Professional algorithm visualization and analysis tools
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Understand complex data structures and algorithms through interactive dashboards.
              Built for engineers, researchers, and technical teams.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('algorithms');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Algorithms
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <GitBranch size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Visualization</h3>
              <p className="text-sm text-gray-600">
                Interactive canvas with real-time updates and visual feedback for algorithm operations
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics</h3>
              <p className="text-sm text-gray-600">
                Track algorithm performance with detailed statistics and performance indicators
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Layers size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurable Parameters</h3>
              <p className="text-sm text-gray-600">
                Adjust algorithm parameters and see immediate visual feedback on behavior changes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Algorithms Section - B2B Card Grid */}
      <section id="algorithms" className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Algorithms</h2>
            <p className="text-gray-600">Select an algorithm to access the interactive dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {algorithms.map((algo) => {
              const Icon = algo.icon;
              return (
                <div
                  key={algo.id}
                  onClick={() => navigate(`/demo/${algo.id}`)}
                  className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Icon size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{algo.name}</h3>
                        <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {algo.description}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                        <span>Open Dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Built with React, TypeScript, and Framer Motion</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#algorithms" className="hover:text-gray-900">Algorithms</a>
              <a href="#features" className="hover:text-gray-900">Features</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
