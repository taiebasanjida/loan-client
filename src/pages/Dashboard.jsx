import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiList,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiMail,
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard - LoanLink';
  }, []);

  const adminLinks = [
    { to: '/dashboard/manage-users', label: 'Manage Users', icon: FiUsers },
    { to: '/dashboard/all-loan', label: 'All Loans', icon: FiDollarSign },
    { to: '/dashboard/loan-applications', label: 'Loan Applications', icon: FiFileText },
    { to: '/dashboard/contact-messages', label: 'Contact Messages', icon: FiMail },
    { to: '/dashboard/profile', label: 'My Profile', icon: FiUser },
  ];

  const managerLinks = [
    { to: '/dashboard/add-loan', label: 'Add Loan', icon: FiPlus },
    { to: '/dashboard/manage-loans', label: 'Manage Loans', icon: FiList },
    { to: '/dashboard/pending-loans', label: 'Pending Applications', icon: FiClock },
    { to: '/dashboard/approved-loans', label: 'Approved Applications', icon: FiCheckCircle },
    { to: '/dashboard/contact-messages', label: 'Contact Messages', icon: FiMail },
    { to: '/dashboard/profile', label: 'My Profile', icon: FiUser },
  ];

  const borrowerLinks = [
    { to: '/dashboard/my-loans', label: 'My Loans', icon: FiFileText },
    { to: '/dashboard/my-messages', label: 'My Messages', icon: FiMail },
    { to: '/dashboard/profile', label: 'My Profile', icon: FiUser },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'manager') return managerLinks;
    return borrowerLinks;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {user?.role === 'admin'
              ? 'Manage the entire LoanLink system'
              : user?.role === 'manager'
              ? 'Manage loans and review applications'
              : 'Track your loan applications'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getLinks().map((link, index) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.to}
                  className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition group"
                >
                  <link.icon className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {link.label}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

