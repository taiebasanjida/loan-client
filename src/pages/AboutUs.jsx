import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiAward, FiHeart } from 'react-icons/fi';

const AboutUs = () => {
  useEffect(() => {
    document.title = 'About Us - LoanLink';
  }, []);

  const values = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Inclusive Access',
      description: 'We believe everyone deserves access to financial resources for growth and development.',
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: 'Transparency',
      description: 'Clear terms, honest communication, and no hidden fees in our loan process.',
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Committed to providing the best service and support to our borrowers.',
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: 'Community Impact',
      description: 'Supporting local businesses and individuals to build stronger communities.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Borrowers' },
    { number: '$50M+', label: 'Loans Disbursed' },
    { number: '95%', label: 'Approval Rate' },
    { number: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About LoanLink</h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Empowering individuals and businesses with accessible microloan solutions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              LoanLink is dedicated to providing fast, transparent, and reliable microloan solutions
              to individuals and small businesses. We believe in financial inclusion and aim to
              bridge the gap between borrowers and lenders through our innovative platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center"
              >
                <div className="text-primary-600 dark:text-primary-400 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose LoanLink?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Fast Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our streamlined application process ensures quick approval and disbursement of funds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Flexible Terms
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from various loan options with flexible repayment schedules that suit your
                needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Secure Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data and transactions are protected with industry-standard security measures.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

