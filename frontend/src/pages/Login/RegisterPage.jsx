import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from "lucide-react";
import { loginSuccess } from "../../store/authSlice";
import { useRegisterMutation } from "../../store/api/authApiSlice";
import Button from "../../components/common/Button";

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const [registerApi, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Developer",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    try {
      const response = await registerApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }).unwrap();

      dispatch(
        loginSuccess({
          user: response.data.user,
          token: response.data.token,
        })
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      setGeneralError(
        err?.data?.message || err?.error || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 transition-colors">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create an <span className="text-blue-600">Account</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Join the Productivity workspace
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300">
            ⚠️ {generalError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Jigar Patel"
                className={`w-full pl-10 pr-3.5 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              <User className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
            </div>
            {formErrors.name && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-3.5 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
            </div>
            {formErrors.email && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Role
            </label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Developer">Software Developer</option>
                <option value="Lead Engineer">Lead Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Administrator">Administrator</option>
              </select>
              <Briefcase className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Password with Eye Toggle Button */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formErrors.password
                    ? "border-rose-500 focus:ring-rose-500"
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
            {formErrors.password && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {formErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password with Eye Toggle Button */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formErrors.confirmPassword
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full py-2.5 mt-2"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
