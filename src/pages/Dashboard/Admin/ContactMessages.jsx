import { useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiEye, FiMail, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';

const ContactMessages = () => {
  useEffect(() => {
    document.title = 'Contact Messages - LoanLink';
  }, []);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const fetchMessages = async () => {
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/api/contact', { params });
      setMessages(response.data.messages);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (messageId) => {
    try {
      const response = await axios.get(`/api/contact/${messageId}`);
      setSelectedMessage(response.data);
    } catch (error) {
      toast.error('Failed to load message details');
    }
  };

  const handleMarkAsReplied = async (messageId) => {
    try {
      await axios.patch(`/api/contact/${messageId}/status`, {
        status: 'Replied',
      });
      toast.success('Message marked as replied');
      fetchMessages();
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'Replied' });
      }
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setReplying(true);
    try {
      await axios.patch(`/api/contact/${selectedMessage._id}/status`, {
        status: 'Replied',
        replyMessage: replyText,
      });
      toast.success('Reply sent successfully');
      setReplyText('');
      setShowReplyForm(false);
      fetchMessages();
      // Refresh selected message
      const response = await axios.get(`/api/contact/${selectedMessage._id}`);
      setSelectedMessage(response.data);
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (messageId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/contact/${messageId}`);
        toast.success('Message deleted successfully');
        fetchMessages();
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(null);
        }
      } catch (error) {
        toast.error('Failed to delete message');
      }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Contact Messages
          </h1>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Read">Read</option>
              <option value="Replied">Replied</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Email
                  </th>
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
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No messages found
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr key={msg._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {msg.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {msg.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {msg.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(msg.status)}`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 items-center">
                          <button
                            onClick={() => handleView(msg._id)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 transition-all duration-200 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                            title="View Details"
                          >
                            <FiEye size={22} />
                          </button>
                          {msg.status !== 'Replied' && (
                            <button
                              onClick={() => handleMarkAsReplied(msg._id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 transition-all duration-200 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Mark as Replied"
                            >
                              <FiCheckCircle size={22} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(msg._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 transition-all duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
                            <FiTrash2 size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedMessage.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Message</p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(selectedMessage.status)}`}
                  >
                    {selectedMessage.status}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Previous Reply</p>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {selectedMessage.replyMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Replied on: {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {selectedMessage.status !== 'Replied' && !showReplyForm && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowReplyForm(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
                    >
                      <FiMail className="w-4 h-4" />
                      <span>Reply to Message</span>
                    </button>
                  </div>
                )}

                {showReplyForm && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Reply
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Type your reply here..."
                    />
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={handleReply}
                        disabled={replying}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                      >
                        {replying ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyText('');
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                {selectedMessage.status !== 'Replied' && !showReplyForm && (
                  <button
                    onClick={() => {
                      handleMarkAsReplied(selectedMessage._id);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Mark as Replied
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessages;

