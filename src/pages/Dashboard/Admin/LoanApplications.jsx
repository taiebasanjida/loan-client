import { useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiEye, FiFilter, FiDollarSign, FiCheckCircle, FiDownload } from 'react-icons/fi';
import { exportToCSV, formatApplicationsForExport } from '../../../utils/exportUtils';

const LoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentData, setRepaymentData] = useState(null);

  useEffect(() => {
    document.title = 'Loan Applications - LoanLink';
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const fetchApplications = async () => {
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/api/applications', { params });
      setApplications(response.data.applications);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (application) => {
    setSelectedApplication(application);
  };

  const handleRecordRepayment = async (application) => {
    try {
      const response = await axios.get(`/api/repayments/${application._id}`);
      setRepaymentData(response.data);
      setSelectedApplication(application);
      setShowRepaymentModal(true);
    } catch (error) {
      toast.error('Failed to load repayment details');
    }
  };

  const handleExportCSV = () => {
    const formattedData = formatApplicationsForExport(applications);
    exportToCSV(formattedData, 'loan_applications');
    toast.success('Applications data exported to CSV');
  };

  const handleRepaymentSubmit = async (amount, transactionId, paymentMethod) => {
    try {
      await axios.post(`/api/repayments/${selectedApplication._id}`, {
        amount: parseFloat(amount),
        transactionId: transactionId || '',
        paymentMethod: paymentMethod || 'Manual Entry',
      });
      toast.success('Repayment recorded successfully');
      setShowRepaymentModal(false);
      setRepaymentData(null);
      fetchApplications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to record repayment';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Loan Applications
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
            >
              <FiDownload className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Loan Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
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
                        <p className="font-medium">{app.userId?.name || 'N/A'}</p>
                        <p className="text-xs">{app.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {app.loanId?.category || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(app)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 transition-all duration-200 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          title="View Details"
                        >
                          <FiEye size={22} />
                        </button>
                        {app.status === 'Approved' && app.repaymentStatus !== 'Complete' && (
                          <button
                            onClick={() => handleRecordRepayment(app)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 transition-all duration-200 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Record Repayment"
                          >
                            <FiDollarSign size={22} />
                          </button>
                        )}
                        {app.status === 'Approved' && app.repaymentStatus === 'Complete' && (
                          <span className="text-green-600 dark:text-green-400 p-1" title="Repayment Complete">
                            <FiCheckCircle size={22} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* View Modal */}
        {selectedApplication && !showRepaymentModal && (
          <ViewApplicationModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}

        {/* Repayment Modal */}
        {showRepaymentModal && repaymentData && selectedApplication && (
          <AdminRepaymentModal
            application={selectedApplication}
            repaymentData={repaymentData}
            onClose={() => {
              setShowRepaymentModal(false);
              setRepaymentData(null);
              setSelectedApplication(null);
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Applicant Name</p>
            <p className="text-gray-900 dark:text-white">
              {application.firstName} {application.lastName}
            </p>
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
          {application.totalAmount && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount (with interest)</p>
                <p className="text-gray-900 dark:text-white">
                  ${application.totalAmount?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  ${(application.paidAmount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Amount</p>
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  ${(application.remainingAmount || application.totalAmount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Repayment Status</p>
                <p className="text-gray-900 dark:text-white capitalize">
                  {application.repaymentStatus || 'Pending'}
                </p>
              </div>
            </>
          )}
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

const AdminRepaymentModal = ({ application, repaymentData, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > repaymentData.remainingAmount) {
      toast.error('Amount cannot exceed remaining balance');
      return;
    }
    onSubmit(amount, transactionId, paymentMethod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Record Repayment
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
              Payment Amount *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter transaction ID if available"
            />
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
              Record Repayment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplications;

