import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoanDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = loan ? `${loan.title} - LoanLink` : 'Loan Details - LoanLink';
  }, [loan]);

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const response = await axios.get(`/api/loans/${id}`);
      setLoan(response.data);
    } catch (error) {
      toast.error('Failed to load loan details');
      console.error('Error fetching loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = () => {
    if (!user) {
      toast.error('Please login to apply for a loan');
      navigate('/login');
      return;
    }

    if (user.role === 'admin' || user.role === 'manager') {
      toast.error('Admins and Managers cannot apply for loans');
      return;
    }

    navigate(`/apply-loan/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Loan not found
          </p>
          <Link
            to="/all-loans"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Back to All Loans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/all-loans"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to All Loans
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loan.images && loan.images[0] && (
            <img
              src={loan.images[0]}
              alt={loan.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {loan.title}
                </h1>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-semibold">
                  {loan.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Interest Rate
                </p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {loan.interestRate}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Maximum Loan Limit
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${loan.maxLoanLimit?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {loan.description}
              </p>
            </div>

            {loan.requiredDocuments && loan.requiredDocuments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Required Documents
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  {loan.requiredDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {loan.emiPlans && loan.emiPlans.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Available EMI Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loan.emiPlans.map((plan, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
                    >
                      <FiCheckCircle className="text-primary-600 dark:text-primary-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">{plan}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user && user.role !== 'admin' && user.role !== 'manager' && (
              <div className="mt-8">
                <button
                  onClick={handleApplyNow}
                  className="w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-lg"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;

