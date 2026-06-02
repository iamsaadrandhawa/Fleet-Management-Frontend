import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // ✅ Add this ref to prevent double submission
  const isSubmitting = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Prevent double submission
    if (isSubmitting.current) {
      console.log('Submission already in progress');
      return;
    }
    
    clearError();
    isSubmitting.current = true;
    
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      // Reset after 2 seconds
      setTimeout(() => {
        isSubmitting.current = false;
      }, 2000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-50 p-4">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting.current || isLoading}
                  className="w-full px-3 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 peer disabled:bg-gray-100"
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none
                    ${email 
                      ? 'text-xs text-blue-600 top-1' 
                      : 'text-gray-500 top-1/2 -translate-y-1/2 text-sm peer-focus:text-xs peer-focus:text-blue-600 peer-focus:top-1 peer-focus:-translate-y-0'
                    }`}
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting.current || isLoading}
                  className="w-full px-3 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 peer disabled:bg-gray-100"
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none
                    ${password 
                      ? 'text-xs text-blue-600 top-1' 
                      : 'text-gray-500 top-1/2 -translate-y-1/2 text-sm peer-focus:text-xs peer-focus:text-blue-600 peer-focus:top-1 peer-focus:-translate-y-0'
                    }`}
                >
                  Password
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting.current || isLoading}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting.current || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting.current || isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="text-center py-4">
        <p className="text-sm text-gray-500">© {currentYear}</p>
      </footer>
    </div>
  );
}