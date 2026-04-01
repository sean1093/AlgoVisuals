import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/shared/Card';
import { getAllAlgorithms } from '../registry';

function LandingPage() {
  const navigate = useNavigate();
  const algorithms = getAllAlgorithms();

  return (
    <div className="min-h-screen bg-warmWhite">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-borderBlue to-pastelBlue bg-clip-text text-transparent">
            Algorithm Canvas
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Interactive Algorithm Visualization Platform
          </p>
          <p className="text-sm text-gray-500">
            Explore data structures and algorithms in action
          </p>
        </motion.div>

        {/* Algorithm Cards Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <motion.div
                key={algo.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 300, damping: 25 }
                  }
                }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/demo/${algo.id}`)}
                  className="h-full"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-pastelBlue flex items-center justify-center">
                      <Icon size={32} className="text-borderBlue" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{algo.name}</h2>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {algo.description}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-pastelBlue font-medium">
                      Click to explore →
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 text-gray-500 text-sm"
        >
          <p>Made with ❤️ using React, TypeScript, and Framer Motion</p>
        </motion.div>
      </div>
    </div>
  );
}

export default LandingPage;
