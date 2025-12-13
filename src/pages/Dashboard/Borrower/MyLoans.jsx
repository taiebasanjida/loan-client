import { useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiEye, FiXCircle, FiDollarSign, FiCheckCircle, FiCreditCard, FiCalendar } from 'react-icons/fi';

// Only initialize Stripe if publishable key is available
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const MyLoans = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [repaymentData, setRepaymentData] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications/my-loans');
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (applicationId) => {
    const result = await Swal.fire({
      title: 'Cancel Application?',
      text: 'Are you sure you want to cancel this application?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/applications/${applicationId}`);
        toast.success('Application cancelled successfully');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to cancel application');
      }
    }
  };

  const handlePay = async (applicationId) => {
    try {
      // Check if Stripe is configured
      if (!stripePromise) {
        toast.error('Payment is not configured. Please contact support.');
        return;
      }

      const response = await axios.post('/api/payments/create-intent', {
        applicationId,
      });
      
      if (response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setShowPaymentModal(true);
        setSelectedApplication(applicationId);
      } else {
        toast.error('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize payment';
      toast.error(errorMessage);
    }
  };

  const handleViewPayment = (application) => {
    setSelectedApplication(application);
  };

  const handleRepay = async (application) => {
    try {
      // Fetch repayment details
      const response = await axios.get(`/api/repayments/${application._id}`);
      setRepaymentData(response.data);
      setSelectedApplication(application);
      setShowRepaymentModal(true);
    } catch (error) {
      toast.error('Failed to load repayment details');
    }
  };

  const handleRepaymentSubmit = async (amount, schedule) => {
    try {
      if (!stripePromise) {
        toast.error('Payment is not configured. Please contact support.');
        return;
      }

      // Create payment intent for repayment
      const response = await axios.post('/api/payments/create-repayment-intent', {
        applicationId: selectedApplication._id,
        amount: Math.round(amount * 100), // Convert to cents
      });
      
      if (response.data.clientSecret) {
        setRepaymentData({ ...repaymentData, amount: Math.round(amount * 100) });
        setClientSecret(response.data.clientSecret);
        setShowRepaymentModal(false);
        setShowPaymentModal(true);
      } else {
        toast.error('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Repayment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize payment';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Loan Applications
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Loan Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Repayment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {app._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <p className="font-medium">{app.loanId?.title || app.loanTitle}</p>
                        <p className="text-xs">{app.loanId?.category || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${app.loanAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          app.status === 'Approved'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : app.status === 'Rejected'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {app.status === 'Approved' ? (
                        <div>
                          {app.repaymentStatus === 'Complete' ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold">Complete</span>
                          ) : (
                            <div>
                              <div className="text-xs">
                                Paid: ${(app.paidAmount || 0).toLocaleString()}
                              </div>
                              <div className="text-xs">
                                Remaining: ${(app.remainingAmount || app.totalAmount || app.loanAmount).toLocaleString()}
                              </div>
                              {app.repaymentStatus && (
                                <span className={`text-xs px-1 py-0.5 rounded ${
                                  app.repaymentStatus === 'In Progress'
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {app.repaymentStatus}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3 items-center">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 transition-all duration-200 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          title="View Details"
                        >
                          <FiEye size={22} />
                        </button>
                        {app.status === 'Pending' && (
                          <button
                            onClick={() => handleCancel(app._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 transition-all duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Cancel Application"
                          >
                            <FiXCircle size={22} />
                          </button>
                        )}
                        {app.applicationFeeStatus === 'Unpaid' && stripePromise && (
                          <button
                            onClick={() => handlePay(app._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 flex items-center px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                            title="Pay Application Fee"
                          >
                            <FiDollarSign size={20} className="mr-1" />
                            Pay
                          </button>
                        )}
                        {app.applicationFeeStatus === 'Paid' && (
                          <button
                            onClick={() => handleViewPayment(app)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 flex items-center px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                            title="View Payment"
                          >
                            <FiCheckCircle size={20} className="mr-1" />
                            Paid
                          </button>
                        )}
                        {app.status === 'Approved' && app.repaymentStatus !== 'Complete' && stripePromise && (
                          <button
                            onClick={() => handleRepay(app)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 flex items-center px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                            title="Make Repayment"
                          >
                            <FiCreditCard size={20} className="mr-1" />
                            Repay
                          </button>
                        )}
                        {app.status === 'Approved' && app.repaymentStatus === 'Complete' && (
                          <span className="text-green-600 dark:text-green-400 flex items-center px-2 py-1" title="Repayment Complete">
                            <FiCheckCircle size={20} className="mr-1" />
                            Complete
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {selectedApplication && !showPaymentModal && (
          <ViewApplicationModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}

        {/* Payment Modal */}
        {showPaymentModal && clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentModal
              applicationId={typeof selectedApplication === 'string' ? selectedApplication : selectedApplication?._id}
              onClose={() => {
                setShowPaymentModal(false);
                setSelectedApplication(null);
                fetchApplications();
              }}
              isRepayment={repaymentData !== null}
              repaymentAmount={repaymentData?.amount || null}
            />
          </Elements>
        )}
        {showPaymentModal && clientSecret && !stripePromise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Payment Unavailable
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Stripe payment is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.
              </p>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                }}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Payment Details Modal */}
        {selectedApplication && selectedApplication.applicationFeeStatus === 'Paid' && !showPaymentModal && (
          <PaymentDetailsModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}

        {/* Repayment Modal */}
        {showRepaymentModal && repaymentData && selectedApplication && (
          <RepaymentModal
            application={selectedApplication}
            repaymentData={repaymentData}
            onClose={() => {
              setShowRepaymentModal(false);
              setRepaymentData(null);
            }}
            onSubmit={handleRepaymentSubmit}
          />
        )}
      </div>
    </div>
  );
};

const ViewApplicationModal = ({ application, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Application Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loan Title</p>
            <p className="text-gray-900 dark:text-white">{application.loanTitle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loan Amount</p>
            <p className="text-gray-900 dark:text-white">
              ${application.loanAmount?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-gray-900 dark:text-white">{application.status}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const PaymentModal = ({ applicationId, onClose, isRepayment = false, repaymentAmount = null }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard/my-loans',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Check if it's a repayment or application fee
        const isRepaymentPayment = paymentIntent.metadata?.type === 'repayment';
        await axios.post('/api/payments/confirm', {
          applicationId,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount,
          type: isRepaymentPayment ? 'repayment' : 'application_fee',
        });
        toast.success(isRepaymentPayment ? 'Repayment successful!' : 'Payment successful!');
        onClose();
      }
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {isRepayment ? `Repayment - $${(repaymentAmount / 100).toLocaleString()}` : 'Payment - $10 Application Fee'}
        </h2>
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {processing ? 'Processing...' : isRepayment ? `Pay $${(repaymentAmount / 100).toLocaleString()}` : 'Pay $10'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RepaymentModal = ({ application, repaymentData, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [schedule, setSchedule] = useState('Monthly');
  const [isRepayment, setIsRepayment] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > repaymentData.remainingAmount) {
      toast.error('Amount cannot exceed remaining balance');
      return;
    }
    onSubmit(parseFloat(amount), schedule);
  };

  // Calculate suggested amounts
  const monthlyAmount = repaymentData.remainingAmount / 12;
  const weeklyAmount = repaymentData.remainingAmount / 52;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Make Repayment
        </h2>
        
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${repaymentData.totalAmount?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Paid:</span>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ${repaymentData.paidAmount?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">
              ${repaymentData.remainingAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repayment Schedule
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSchedule('Monthly');
                  setAmount(monthlyAmount.toFixed(2));
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  schedule === 'Monthly'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                <FiCalendar className="inline mr-2" />
                Monthly (${monthlyAmount.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchedule('Weekly');
                  setAmount(weeklyAmount.toFixed(2));
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  schedule === 'Weekly'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                <FiCalendar className="inline mr-2" />
                Weekly (${weeklyAmount.toFixed(2)})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={repaymentData.remainingAmount}
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter amount"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum: ${repaymentData.remainingAmount?.toLocaleString()}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentDetailsModal = ({ application, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Payment Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-white">{application.userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
            <p className="text-gray-900 dark:text-white">
              {application.paymentDetails?.transactionId || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loan ID</p>
            <p className="text-gray-900 dark:text-white">{application._id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-gray-900 dark:text-white">
              ${application.paymentDetails?.amount || 10}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Date</p>
            <p className="text-gray-900 dark:text-white">
              {application.paymentDetails?.paymentDate
                ? new Date(application.paymentDetails.paymentDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MyLoans;

