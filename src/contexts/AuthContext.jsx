import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase.config';
import axios from '../utils/axios'; // Use configured axios instance with baseURL
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  // Use refs for timers to avoid dependency issues
  const autoLogoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Auto logout configuration (30 minutes for finance app - standard for financial applications)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout

  // performLogout function - must be defined before handleAutoLogout
  const performLogout = useCallback(async (isAutoLogout = false) => {
    try {
      // Clear all authentication data
      localStorage.removeItem('token');
      
      // Clear all cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Logout from backend
      try {
        await axios.post('/api/auth/logout', {}, { withCredentials: true });
      } catch (backendError) {
        // Continue even if backend logout fails
        console.log('Backend logout error:', backendError);
      }

      // Logout from Firebase if initialized
      if (auth) {
        try {
          await firebaseSignOut(auth);
        } catch (firebaseError) {
          console.log('Firebase logout skipped');
        }
      }

      // Clear user state
      setUser(null);
      setShowSessionWarning(false);
      setLastActivity(Date.now());

      // Prevent automatic re-login by clearing checkAuth
      if (!isAutoLogout) {
        toast.success('Logged out successfully');
      }

      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (error) {
      // Even if everything fails, clear user state
      setUser(null);
      localStorage.removeItem('token');
      sessionStorage.clear();
      if (!isAutoLogout) {
        toast.success('Logout completed');
      }
    }
  }, []);

  const handleAutoLogout = useCallback(async () => {
    // Clear all timers
    if (autoLogoutTimerRef.current) clearTimeout(autoLogoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Show professional session expired message
    toast.error('Your session has expired. You have been automatically logged out for security.', {
      duration: 8000,
      icon: '🔒',
    });

    // Perform logout
    await performLogout(true); // true = auto logout
  }, [performLogout]);

  // Activity tracking - reset timer on user activity
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      const now = Date.now();
      setLastActivity(now);
      lastActivityRef.current = now;
      setShowSessionWarning(false);
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  // Auto logout timer
  useEffect(() => {
    if (!user) {
      // Clear timers when logged out
      if (autoLogoutTimerRef.current) {
        clearTimeout(autoLogoutTimerRef.current);
        autoLogoutTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      return;
    }

    // Check inactivity every minute
    const checkInactivity = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceActivity = currentTime - lastActivityRef.current;
      const timeUntilLogout = SESSION_TIMEOUT - timeSinceActivity;

      // Show warning 5 minutes before logout
      if (timeUntilLogout <= WARNING_TIME && timeUntilLogout > 0 && !showSessionWarning) {
        setShowSessionWarning(true);
        const minutesLeft = Math.ceil(timeUntilLogout / 60000);
        toast.error(
          `Warning: Your session will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Please stay active for security.`,
          { 
            duration: 10000,
            icon: '⏰',
          }
        );
      }

      // Auto logout after inactivity
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        clearInterval(checkInactivity);
        handleAutoLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [user, lastActivity, showSessionWarning, handleAutoLogout]);

  useEffect(() => {
    // Only check auth if user is not explicitly logged out
    const shouldCheckAuth = !localStorage.getItem('logout_flag');
    if (shouldCheckAuth) {
      checkAuth();
    } else {
      // Clear logout flag
      localStorage.removeItem('logout_flag');
      setLoading(false);
    }
    
    // Listen for token expiration events from axios interceptor
    const handleTokenExpired = () => {
      if (user) {
        toast.error('Your session has expired. Please login again.', {
          duration: 6000,
          icon: '⏰',
        });
        performLogout();
      }
    };
    
    window.addEventListener('tokenExpired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const checkAuth = async () => {
    // Check if user explicitly logged out
    if (localStorage.getItem('logout_flag')) {
      localStorage.removeItem('logout_flag');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true,
      });
      
      // Store token in localStorage if received (for users who logged in before this fix)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Remove token from user object before setting state
        const { token, ...userData } = response.data;
        setUser(userData);
      } else {
        setUser(response.data);
      }
      
      // Reset activity timer on successful auth check
      setLastActivity(Date.now());
      lastActivityRef.current = Date.now();
    } catch (error) {
      // Don't show error for 401 (not authenticated) - that's normal
      if (error.response?.status === 503) {
        console.error('Database connection error. Please ensure the server is running and MongoDB is connected.');
      }
      setUser(null);
      // Clear invalid token from localStorage
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, photoURL, role, password) => {
    try {
      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter');
      }

      // Register with backend first (primary source of truth)
      let backendResponse;
      try {
        backendResponse = await axios.post(
          '/api/auth/register',
          { name, email, photoURL: photoURL || '', role, password },
          { withCredentials: true }
        );
      } catch (backendError) {
        // If backend says user exists, show appropriate message
        if (backendError.response?.data?.message?.includes('already exists') || 
            backendError.response?.data?.message?.includes('User already exists')) {
          toast.error('This email is already registered. Please login instead.');
          throw new Error('User already exists. Please login instead.');
        }
        throw backendError;
      }

      // If backend registration successful, try Firebase (optional - for Google login compatibility)
      // Only try Firebase if auth is properly initialized
      if (auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Update Firebase profile
          await firebaseUser.updateProfile({
            displayName: name,
            photoURL: photoURL || '',
          });
        } catch (firebaseError) {
          // If Firebase error, it's okay - backend registration is primary
          // Silently ignore Firebase errors - backend registration is what matters
          console.log('Firebase registration skipped or failed, but backend registration successful');
          // Don't throw error - backend registration is primary
        }
      } else {
        // Firebase not initialized, skip Firebase registration
        console.log('Firebase not initialized, skipping Firebase registration');
      }

      // Store token in localStorage as fallback for cross-origin cookie issues
      if (backendResponse.data.token) {
        localStorage.setItem('token', backendResponse.data.token);
      }

      // Clear logout flag and reset activity timer
      localStorage.removeItem('logout_flag');
      setLastActivity(Date.now());
      setShowSessionWarning(false);

      setUser(backendResponse.data.user);
      toast.success('Registration successful!');
      return backendResponse.data.user;
    } catch (error) {
      // Handle errors with better messages
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login instead.');
      } else if (error.message.includes('already exists') || error.message.includes('already registered')) {
        toast.error('This email is already registered. Please login instead.');
      } else {
        const message = error.response?.data?.message || error.message || 'Registration failed';
        toast.error(message);
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // Login with backend first (primary source of truth)
      const response = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.user.isSuspended) {
        toast.error('Account suspended: ' + response.data.user.suspendReason);
        throw new Error('Account suspended');
      }

      // If backend login successful, try Firebase (optional - for Google login compatibility)
      // Only try Firebase if auth is properly initialized
      if (auth) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseError) {
          // If Firebase error, it's okay - backend login is primary
          // User might not have Firebase account, but backend login succeeded
          // Silently ignore Firebase errors - backend login is what matters
          console.log('Firebase login skipped or failed, but backend login successful');
          // Don't throw error - backend login is primary
        }
      } else {
        // Firebase not initialized, skip Firebase login
        console.log('Firebase not initialized, skipping Firebase login');
      }

      // Store token in localStorage as fallback for cross-origin cookie issues
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Clear logout flag and reset activity timer
      localStorage.removeItem('logout_flag');
      setLastActivity(Date.now());
      setShowSessionWarning(false);

      setUser(response.data.user);
      toast.success('Login successful!');
      return response.data.user;
    } catch (error) {
      // Handle backend errors
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (error.response?.status === 403) {
        toast.error('Account suspended: ' + (error.response?.data?.reason || ''));
      } else if (error.response?.status === 503) {
        toast.error('Database connection error. Please ensure the server is running and MongoDB is connected.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check if the backend server is running.');
      } else if (!error.response) {
        toast.error('Cannot connect to server. Please ensure the backend server is running on port 5000.');
      } else {
        const message = error.response?.data?.message || error.message || 'Login failed';
        toast.error(message);
      }
      throw error;
    }
  };

  const loginWithGoogle = async (selectedRole = null, isFromSignUp = false) => {
    try {
      // Check if Firebase is initialized
      if (!auth || !googleProvider) {
        toast.error('Google login is not available. Please use email/password login.');
        throw new Error('Firebase not initialized');
      }

      // Handle Google sign-in popup
      // Note: Cross-Origin-Opener-Policy warnings in console are harmless browser security warnings
      // They don't affect functionality - Firebase popup works correctly
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        // Handle popup-specific errors
        if (popupError.code === 'auth/popup-closed-by-user') {
          throw popupError; // Re-throw to be handled below
        }
        // Ignore Cross-Origin-Opener-Policy related errors (they're warnings, not actual errors)
        if (popupError.message?.includes('Cross-Origin-Opener-Policy') || 
            popupError.message?.includes('window.closed')) {
          // Try again - the popup should still work
          result = await signInWithPopup(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
      
      const firebaseUser = result.user;

      // Check if user exists in backend by trying to login
      try {
        const response = await axios.post(
          '/api/auth/login',
          {
            email: firebaseUser.email,
            password: 'google-auth', // Backend will recognize this as Google auth
          },
          { withCredentials: true }
        );
        // User exists in backend - login successful
        // Store token in localStorage as fallback for cross-origin cookie issues
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Clear logout flag and reset activity timer
        localStorage.removeItem('logout_flag');
        setLastActivity(Date.now());
        setShowSessionWarning(false);

        setUser(response.data.user);
        // If called from sign up page and user already exists, show warning and return flag
        if (isFromSignUp) {
          toast.error('Account exists. Please use Sign In.');
          return { 
            user: response.data.user, 
            wasAlreadyRegistered: true 
          };
        }
        toast.success('Login successful!');
        return response.data.user;
      } catch (loginError) {
        // If login fails (user doesn't exist), register them
        if (loginError.response?.status === 401) {
          // Default role for Google sign up - use 'borrower' if not provided
          // If from sign up page, always use default role 'borrower'
          // If from login page and no role selected, show role selection modal
          const defaultRole = isFromSignUp ? 'borrower' : (selectedRole || 'borrower');
          
          // If role not provided and called from login page, return user info for role selection
          if (!selectedRole && !isFromSignUp) {
            return {
              needsRoleSelection: true,
              userInfo: {
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL || '',
              }
            };
          }

          try {
            // Register user with role (default: 'borrower' for sign up, selected role for login)
            const registerResponse = await axios.post(
              '/api/auth/register',
              {
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL || '',
                role: defaultRole, // Use default role (borrower) for sign up, selected role for login
                password: 'google-auth-' + Date.now(), // Temporary password for Google users
              },
              { withCredentials: true }
            );
            // Store token in localStorage as fallback for cross-origin cookie issues
            if (registerResponse.data.token) {
              localStorage.setItem('token', registerResponse.data.token);
            }

            // Clear logout flag and reset activity timer
            localStorage.removeItem('logout_flag');
            setLastActivity(Date.now());
            setShowSessionWarning(false);

            setUser(registerResponse.data.user);
            toast.success('Registration successful!');
            return registerResponse.data.user;
          } catch (registerError) {
            // Check if user already exists - this can happen if:
            // 1. User was created in backend but not in Firebase (email/password signup)
            // 2. Race condition - multiple signup attempts
            // 3. User was created previously but Firebase auth was cleared
            if (registerError.response?.data?.message?.includes('already exists') || 
                registerError.response?.data?.message?.includes('User already exists')) {
              // User exists in backend, try to login instead
              console.log('User already exists in backend, attempting login...');
              try {
                const loginResponse = await axios.post(
                  '/api/auth/login',
                  {
                    email: firebaseUser.email,
                    password: 'google-auth',
                  },
                  { withCredentials: true }
                );
                
                // Store token in localStorage
                if (loginResponse.data.token) {
                  localStorage.setItem('token', loginResponse.data.token);
                }

                // Clear logout flag and reset activity timer
                localStorage.removeItem('logout_flag');
                setLastActivity(Date.now());
                setShowSessionWarning(false);

                setUser(loginResponse.data.user);
                
                // If from sign up page, show warning and return flag for redirect
                if (isFromSignUp) {
                  toast.error('This email already has an account. Please use Sign In.');
                  return { 
                    user: loginResponse.data.user, 
                    wasAlreadyRegistered: true 
                  };
                } else {
                  // If from login page, automatically log them in
                  toast.success('Login successful!');
                  return loginResponse.data.user;
                }
              } catch (autoLoginError) {
                // If auto login also fails, it means backend user exists but can't login with Google auth
                // This shouldn't happen normally, but handle it gracefully
                console.error('Auto login failed:', autoLoginError);
                if (isFromSignUp) {
                  toast.error('Account exists but login failed. Please try Sign In with email/password.');
                  return { wasAlreadyRegistered: true };
                } else {
                  toast.error('Account exists but login failed. Please try again.');
                  throw autoLoginError;
                }
              }
            } else {
              // Other registration errors
              const message = registerError.response?.data?.message || 'Registration failed';
              toast.error(message);
            }
            throw registerError;
          }
        } else {
          // Other errors
          const message = loginError.response?.data?.message || 'Google login failed';
          toast.error(message);
          throw loginError;
        }
      }
    } catch (error) {
      // Firebase authentication error
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled');
      } else {
        toast.error('Google login failed');
      }
      throw error;
    }
  };

  const logout = async () => {
    // Set logout flag to prevent automatic re-login
    localStorage.setItem('logout_flag', 'true');
    
    // Perform logout
    await performLogout(false);
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

