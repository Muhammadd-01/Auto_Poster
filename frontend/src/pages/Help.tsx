import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export const Help = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-3">
            <HelpCircle className="w-8 h-8 text-orange-500" />
            <span>Help & Documentation</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Learn how to use AutoPost and get support.
          </p>
        </div>
        
        <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-950/5 text-center py-20">
          <p className="text-gray-500 font-medium text-sm">Documentation and tutorials will be available soon.</p>
        </div>
      </main>
    </motion.div>
  );
};
