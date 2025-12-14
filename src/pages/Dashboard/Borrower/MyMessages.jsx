import { useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiMail, FiClock, FiCheckCircle, FiEye } from 'react-icons/fi';

const MyMessages = () => {
  useEffect(() => {
    document.title = 'My Messages - LoanLink';
  }, []);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [page]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/contact/my-messages', {
        params: { page, limit: 10 },
      });
      setMessages(response.data.messages || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching messages:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load messages';
      toast.error(errorMessage);
      // Set empty array on error so UI shows "No Messages Yet" instead of error state
      setMessages([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (messageId) => {
    try {
      const response = await axios.get(`/api/contact/my-messages/${messageId}`);
      setSelectedMessage(response.data);
    } catch (error) {
      toast.error('Failed to load message details');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      New: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      Read: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      Replied: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    };
    return badges[status] || badges.New;
  };

  const getStatusIcon = (status) => {
    if (status === 'Replied') return <FiCheckCircle className="w-5 h-5" />;
    if (status === 'Read') return <FiClock className="w-5 h-5" />;
    return <FiMail className="w-5 h-5" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Messages
        </h1>

        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <FiMail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Messages Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't sent any messages to us yet.
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Contact Us
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {messages.map((msg) => (
                      <tr key={msg._id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {msg.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded flex items-center space-x-1 w-fit ${getStatusBadge(msg.status)}`}
                          >
                            {getStatusIcon(msg.status)}
                            <span>{msg.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleView(msg._id)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 transition-all duration-200 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                            title="View Details"
                          >
                            <FiEye size={22} />
                          </button>
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

            {/* View Message Modal */}
            {selectedMessage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Message Details
                    </h2>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedMessage.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Message</p>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        {selectedMessage.message}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded flex items-center space-x-1 w-fit ${getStatusBadge(selectedMessage.status)}`}
                      >
                        {getStatusIcon(selectedMessage.status)}
                        <span>{selectedMessage.status}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedMessage.replyMessage && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Reply from LoanLink
                        </p>
                        <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600 p-4 rounded">
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                            {selectedMessage.replyMessage}
                          </p>
                          {selectedMessage.repliedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Replied on: {new Date(selectedMessage.repliedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {!selectedMessage.replyMessage && selectedMessage.status === 'Replied' && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          Reply is being processed. You will receive it via email.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyMessages;

