import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AllLoans from './pages/AllLoans';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import LoanDetails from './pages/LoanDetails';
import LoanApplicationForm from './pages/LoanApplicationForm';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/Dashboard/Admin/ManageUsers';
import AllLoanAdmin from './pages/Dashboard/Admin/AllLoan';
import LoanApplications from './pages/Dashboard/Admin/LoanApplications';
import AddLoan from './pages/Dashboard/Manager/AddLoan';
import ManageLoans from './pages/Dashboard/Manager/ManageLoans';
import PendingLoans from './pages/Dashboard/Manager/PendingLoans';
import ApprovedLoans from './pages/Dashboard/Manager/ApprovedLoans';
import MyLoans from './pages/Dashboard/Borrower/MyLoans';
import Profile from './pages/Dashboard/Profile';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="all-loans" element={<AllLoans />} />
              <Route path="about-us" element={<AboutUs />} />
              <Route path="contact" element={<Contact />} />
              <Route
                path="loan-details/:id"
                element={
                  <PrivateRoute>
                    <LoanDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="apply-loan/:id"
                element={
                  <PrivateRoute allowedRoles={['borrower']}>
                    <LoanApplicationForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              {/* Admin Routes */}
              <Route
                path="dashboard/manage-users"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="dashboard/all-loan"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AllLoanAdmin />
                  </PrivateRoute>
                }
              />
              <Route
                path="dashboard/loan-applications"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <LoanApplications />
                  </PrivateRoute>
                }
              />
              {/* Manager Routes */}
              <Route
                path="dashboard/add-loan"
                element={
                  <PrivateRoute allowedRoles={['manager', 'admin']}>
                    <AddLoan />
                  </PrivateRoute>
                }
              />
              <Route
                path="dashboard/manage-loans"
                element={
                  <PrivateRoute allowedRoles={['manager', 'admin']}>
                    <ManageLoans />
                  </PrivateRoute>
                }
              />
              <Route
                path="dashboard/pending-loans"
                element={
                  <PrivateRoute allowedRoles={['manager', 'admin']}>
                    <PendingLoans />
                  </PrivateRoute>
                }
              />
              <Route
                path="dashboard/approved-loans"
                element={
                  <PrivateRoute allowedRoles={['manager', 'admin']}>
                    <ApprovedLoans />
                  </PrivateRoute>
                }
              />
              {/* Borrower Routes */}
              <Route
                path="dashboard/my-loans"
                element={
                  <PrivateRoute allowedRoles={['borrower']}>
                    <MyLoans />
                  </PrivateRoute>
                }
              />
              {/* Common Routes */}
              <Route
                path="dashboard/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              marginTop: '20px',
              marginRight: '20px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
          containerStyle={{
            top: 20,
            right: 20,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

