import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBriefcase, FiX } from 'react-icons/fi';

const RoleSelectionModal = ({ isOpen, onSelect, userInfo }) => {
  const [selectedRole, setSelectedRole] = useState('borrower');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelect(selectedRole);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select Your Role
            </h2>
            <button
              onClick={() => onSelect(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Welcome, <span className="font-semibold">{userInfo?.name}</span>! 
            Please select your role to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-6">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedRole === 'borrower'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="borrower"
                  checked={selectedRole === 'borrower'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <div className={`p-3 rounded-lg mr-4 ${
                    selectedRole === 'borrower'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <FiUser className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Borrower
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Apply for loans and manage your applications
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedRole === 'manager'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={selectedRole === 'manager'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <div className={`p-3 rounded-lg mr-4 ${
                    selectedRole === 'manager'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <FiBriefcase className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Manager
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Manage loans, review applications, and approve requests
                    </div>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Continue
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoleSelectionModal;

