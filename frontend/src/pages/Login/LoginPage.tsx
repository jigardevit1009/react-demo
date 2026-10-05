import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginSuccess } from "../../store/authSlice";
import { useLoginMutation } from "../../store/api/authApiSlice";
import Button from "../../components/common/Button";
import { getErrorMessage } from "../../utils/error";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [loginApi, { isLoading }] = useLoginMutation();

  const locationState = location.state as { from?: { pathname: string } } | undefined;
  const from = locationState?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const errs: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errs.email = "Email is required.";
    }
    if (!password) {
      errs.password = "Password is required.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});

    try {
      const response = await loginApi({ email, password }).unwrap();

      dispatch(
        loginSuccess({
          user: response.data.user,
          token: response.data.token,
        }),
      );

      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setErrorMessage(getErrorMessage(err, "Invalid email or password. Please try again."));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-3.5 sm:p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-8 transition-colors">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Task<span className="text-blue-600">Track</span>
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-3.5 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.email
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
            </div>
            {fieldErrors.email && (
              <span className="text-xs text-rose-500 dark:text-rose-400 mt-1 block font-medium">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.password
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="text-xs text-rose-500 dark:text-rose-400 mt-1 block font-medium">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full py-2.5 mt-2"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
