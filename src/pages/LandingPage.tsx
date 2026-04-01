import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getAllAlgorithms } from '../registry';

function LandingPage() {
  const algorithms = getAllAlgorithms();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="pt-12 md:pt-20 pb-8 md:pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6 md:mb-8">
            <Sparkles size={18} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Algorithm Canvas</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-6 md:mb-8 leading-tight px-4">
            Visualize Algorithms
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              with Clarity
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Interactive visualizations that help you understand data structures and algorithms through hands-on exploration
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Algorithms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {algorithms.map((algo) => {
              const Icon = algo.icon;
              return (
                <Link
                  key={algo.id}
                  to={`/demo/${algo.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-md">
                      <Icon size={24} className="text-white md:w-7 md:h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors">
                        {algo.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {algo.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, and Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
