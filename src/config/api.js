// API Configuration
// This file contains the API base URL configuration

// Production API URL (Vercel deployment)
const PRODUCTION_API_URL = 'https://loan-link-server-ten.vercel.app';

// Get API URL from environment variable or use Vercel deployment
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

// Export for use in other files if needed
export default API_BASE_URL;

