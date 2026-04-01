import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/shared/Card';
import { getAllAlgorithms } from '../registry';

function LandingPage() {
  const navigate = useNavigate();
  const algorithms = getAllAlgorithms();

  return (
    <div className="min-h-screen bg-warmWhite">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-bold mb-3 text-textPrimary tracking-tight">
            Algorithm Canvas
          </h1>
          <p className="text-lg text-textSecondary font-light">
            Explore data structures and algorithms through interactive visualizations
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
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <motion.div
                key={algo.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/demo/${algo.id}`)}
                  className="h-full"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-pastelBlue flex items-center justify-center flex-shrink-0">
                        <Icon size={24} className="text-accentBlue" />
                      </div>
                      <h2 className="text-2xl font-semibold text-textPrimary">{algo.name}</h2>
                    </div>
                    <p className="text-textSecondary leading-relaxed">
                      {algo.description}
                    </p>
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
          transition={{ delay: 0.3 }}
          className="text-center mt-24 text-textSecondary text-sm font-light"
        >
          <p>Made with React, TypeScript, and Framer Motion</p>
        </motion.div>
      </div>
    </div>
  );
}

export default LandingPage;
