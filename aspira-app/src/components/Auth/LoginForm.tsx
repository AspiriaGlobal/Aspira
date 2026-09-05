// components/login/LoginForm.jsx
import { ChangeEvent, FormEvent, useState } from "react";
import { Compass, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../stats/api/axios";
import { useAuth } from "../../context/AuthContext";

import axios from "axios";
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      setAccessToken(data.accessToken);
      navigate("/dashboard");

      // Handle successful login, e.g., store token, redirect, etc.
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

      <h1 className="font-serif font-bold text-3xl text-[#121D33] mb-2">
        Welcome Back
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      <p className="text-sm text-[#8A93A6] mb-8">
        Don't have an account?{" "}
        <Link to="/signup" className="underline text-[#121D33]">
          Sign Up
        </Link>
      </p>

      <form className="space-y-5" onSubmit={handleSubmit}>
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
            className="w-full px-4 py-3 rounded-lg border border-[#8A93A6]/30 text-sm focus:outline-none focus:border-[#E0A63C]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#121D33] text-white text-sm font-semibold"
        >
          {isSubmitting ? "Signing in..." : "Log In"} <ArrowRight size={16} />
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#8A93A6]/30" />
        <span className="text-xs text-[#8A93A6]">or continue with</span>
        <div className="flex-1 h-px bg-[#8A93A6]/30" />
      </div>

      <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#8A93A6]/30 text-sm font-medium text-[#121D33]">
        <span className="text-lg">G</span> Continue with Google
      </button>
    </div>
  );
}
