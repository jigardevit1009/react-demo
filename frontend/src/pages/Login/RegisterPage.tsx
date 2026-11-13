import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Mail } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginSuccess } from "../../store/authSlice";
import { useRegisterMutation } from "../../store/api/authApiSlice";
import AuthLayout from "../../components/layout/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import FormInput from "../../components/common/FormInput";
import NewPasswordFields from "../../components/common/NewPasswordFields";
import { getErrorMessage } from "../../utils/error";
import {
  sanitizeText,
  removeWhitespace,
  validateName,
  validateEmail,
  validatePasswordPair,
} from "../../utils/validation";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const BLANK_FORM: RegisterForm = { name: "", email: "", password: "", confirmPassword: "" };

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [registerApi, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState<RegisterForm>(BLANK_FORM);
  const [formErrors, setFormErrors] = useState<Partial<RegisterForm>>({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  /** Updates one field and clears its error. Passwords are already whitespace-free. */
  const setField = (field: keyof RegisterForm) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
    if (generalError) setGeneralError("");
  };

  const validateForm = (): boolean => {
    const errors: Partial<RegisterForm> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    const pwdErrors = validatePasswordPair(
      formData.password,
      formData.confirmPassword,
      "Password",
      "Confirm password",
    );
    if (pwdErrors.password) errors.password = pwdErrors.password;
    if (pwdErrors.confirmPassword) errors.confirmPassword = pwdErrors.confirmPassword;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return;

    try {
      const response = await registerApi({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }).unwrap();
      dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setGeneralError(getErrorMessage(err, "Registration failed. Please try again."));
    }
  };

  return (
    <AuthLayout
      header={
        <>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create an <span className="text-blue-600">Account</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join the TaskTrack workspace</p>
        </>
      }
      footer={
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <Alert variant="error" className="mb-4">
        {generalError}
      </Alert>

      <form onSubmit={handleRegister} noValidate className="space-y-4">
        <FormInput
          label="Name"
          required
          name="name"
          icon={UserIcon}
          autoComplete="name"
          value={formData.name}
          onChange={(e) => setField("name")(sanitizeText(e.target.value))}
          placeholder="Enter your name"
          error={formErrors.name}
        />

        <FormInput
          label="Email"
          required
          type="email"
          name="email"
          icon={Mail}
          autoComplete="email"
          value={formData.email}
          onChange={(e) => setField("email")(removeWhitespace(e.target.value))}
          placeholder="Enter your email address"
          error={formErrors.email}
        />

        <NewPasswordFields
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          onPasswordChange={setField("password")}
          onConfirmPasswordChange={setField("confirmPassword")}
          passwordError={formErrors.password}
          confirmPasswordError={formErrors.confirmPassword}
          passwordLabel="Password"
          confirmPasswordLabel="Confirm Password"
          passwordPlaceholder="Create a password (min. 6 characters)"
          confirmPasswordPlaceholder="Re-enter your password"
          showConfirmToggle
        />

        <Button type="submit" variant="primary" disabled={isLoading} className="w-full py-2.5 mt-2">
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
