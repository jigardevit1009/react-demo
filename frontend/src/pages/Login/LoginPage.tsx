import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginSuccess } from "../../store/authSlice";
import { useLoginMutation } from "../../store/api/authApiSlice";
import AuthLayout from "../../components/layout/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import FormInput from "../../components/common/FormInput";
import PasswordInput from "../../components/common/PasswordInput";
import { getErrorMessage } from "../../utils/error";
import { removeWhitespace, validateEmail } from "../../utils/validation";

const LINK_CLASS = "font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const errs: { email?: string; password?: string } = {};
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    if (!password) errs.password = "Password is required.";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const response = await loginApi({ email: email.trim(), password }).unwrap();
      dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setErrorMessage(getErrorMessage(err, "Invalid email or password. Please try again."));
    }
  };

  return (
    <AuthLayout
      header={
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Task<span className="text-blue-600">Track</span>
        </h1>
      }
      footer={
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className={LINK_CLASS}>
            Create an account
          </Link>
        </p>
      }
    >
      <Alert variant="error" className="mb-4">
        {errorMessage}
      </Alert>

      <form onSubmit={handleLogin} noValidate className="space-y-4">
        <FormInput
          label="Email Address"
          required
          type="email"
          icon={Mail}
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(removeWhitespace(e.target.value));
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="Enter your email address"
          error={fieldErrors.email}
        />

        <PasswordInput
          label="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Enter your password"
          error={fieldErrors.password}
          labelAction={
            <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" variant="primary" disabled={isLoading} className="w-full py-2.5 mt-2">
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
