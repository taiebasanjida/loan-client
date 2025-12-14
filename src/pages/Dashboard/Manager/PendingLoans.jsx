import { useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';

const PendingLoans = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    document.title = 'Pending Applications - LoanLink';
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications?status=Pending');
      setApplications(response.data.applications || response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    const result = await Swal.fire({
      title: 'Approve Application?',
      text: 'This will approve the loan application',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/applications/${applicationId}/status`, {
          status: 'Approved',
        });
        toast.success('Application approved successfully');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to approve application');
      }
    }
  };

  const handleReject = async (applicationId) => {
    const result = await Swal.fire({
      title: 'Reject Application?',
      text: 'This will reject the loan application',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/applications/${applicationId}/status`, {
          status: 'Rejected',
        });
        toast.success('Application rejected');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to reject application');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Pending Loan Applications
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                    User Info
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 dark:text-white">
                      {app._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                      <div>
                        <p className="font-medium text-base">
                          {app.firstName} {app.lastName}
                        </p>
                        <p className="text-sm">{app.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                      ${app.loanAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 transition-all duration-200 relative group"
                          title="View"
                        >
                          <FiEye size={24} />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            View
                          </span>
                        </button>
                        <button
                          onClick={() => handleApprove(app._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 transition-all duration-200 relative group"
                          title="Approve"
                        >
                          <FiCheckCircle size={24} />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Approve
                          </span>
                        </button>
                        <button
                          onClick={() => handleReject(app._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 transition-all duration-200 relative group"
                          title="Cancel"
                        >
                          <FiXCircle size={24} />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Cancel
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {selectedApplication && (
          <ViewApplicationModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Applicant</p>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Reason for Loan</p>
            <p className="text-gray-900 dark:text-white">{application.reasonForLoan}</p>
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

export default PendingLoans;

