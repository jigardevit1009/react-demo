import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import { useLoginMutation } from "../../store/api/authApiSlice";
import Button from "../../components/common/Button";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loginApi, { isLoading }] = useLoginMutation();

  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("jigar.p@company.com");
  const [password, setPassword] = useState("secret123");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Execute genuine JWT login against backend
      const response = await loginApi({ email, password }).unwrap();

      // Dispatch to Redux store
      dispatch(
        loginSuccess({
          user: response.data.user,
          token: response.data.token,
        })
      );

      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage(
        err?.data?.message || err?.error || "Invalid credentials. Try secret123 or admin123"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 transition-colors">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Productivity<span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in with your JWT credentials</p>
        </div>

        {location.state?.from && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            🔒 Please sign in to view <strong>{location.state.from.pathname}</strong>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jigar.p@company.com"
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. secret123"
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full py-2.5"
          >
            {isLoading ? "Verifying Credentials..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400">
            Demo credentials: <strong className="text-gray-600 dark:text-gray-300">jigar.p@company.com</strong> / <strong className="text-gray-600 dark:text-gray-300">secret123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
