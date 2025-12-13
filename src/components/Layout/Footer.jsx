import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary-400 mb-4">LoanLink</h3>
            <p className="text-gray-400">
              A comprehensive microloan request, review & approval management system
              designed for small financial organizations, NGOs, and microloan providers.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Useful Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/all-loans"
                  className="text-gray-400 hover:text-primary-400 transition"
                >
                  All Loans
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-primary-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-primary-400 transition"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@loanlink.com</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} LoanLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

