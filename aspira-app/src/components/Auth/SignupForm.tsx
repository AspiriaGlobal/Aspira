// components/Auth/SignupForm.jsx
import { ChangeEvent, FormEvent, useState } from "react";
import { Compass, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../stats/api/axios"; // adjust path to match your structure
import { useAuth } from "../../context/AuthContext"; // adjust path
import axios from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function SignupForm() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAccessToken, loginwithGoogle } = useAuth();
  const navigate = useNavigate();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    setError("");
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    try {
      await loginwithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });

      // Auto-login: signup response carries the same shape as login
      setAccessToken(data.accessToken);
      navigate("/dashboard"); // adjust to wherever a logged-in user should land
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;

        if (responseData?.errors?.length) {
          // Join all field errors into one readable string, e.g.
          // "Password must contain an uppercase letter, Password must contain a number"
          setError(
            responseData.errors
              .map((e: { message: string }) => e.message)
              .join(", "),
          );
        } else if (responseData?.message) {
          setError(responseData.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 md:p-10">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-[#1C2B4A] flex items-center justify-center">
          <Compass size={16} className="text-[#F7F5F0]" />
        </div>
        <span className="text-lg font-serif font-bold text-[#121D33]">
          Aspiria
        </span>
      </div>

      <h1 className="font-serif font-bold text-2xl md:text-3xl text-[#121D33] mb-2">
        Create your account
      </h1>
      <p className="text-sm text-[#8A93A6] mb-6">
        Already have an account?{" "}
        <Link to="/login" className="underline text-[#121D33]">
          Log In
        </Link>
      </p>

      {/* Role toggle */}
      <div className="flex bg-[#F7F5F0] rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            role === "student"
              ? "bg-white shadow text-[#121D33]"
              : "text-[#8A93A6]"
          }`}
        >
          I'm A Student
        </button>
        <button
          type="button"
          onClick={() => setRole("parent")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            role === "parent"
              ? "bg-white shadow text-[#121D33]"
              : "text-[#8A93A6]"
          }`}
        >
          I'm A Parent
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Chisom Nwosu"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#8A93A6]/30 text-sm focus:outline-none focus:border-[#E0A63C]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#8A93A6]/30 text-sm focus:outline-none focus:border-[#E0A63C]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-[#8A93A6]/30 text-sm focus:outline-none focus:border-[#E0A63C] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A93A6]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-[#8A93A6]/30 text-sm focus:outline-none focus:border-[#E0A63C] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A93A6]"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#121D33] text-white text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}{" "}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#8A93A6]/30" />
        <span className="text-xs text-[#8A93A6]">or continue with</span>
        <div className="flex-1 h-px bg-[#8A93A6]/30" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-up failed. Please try again.")}
          text="signup_with"
        />
      </div>
    </div>
  );
}
