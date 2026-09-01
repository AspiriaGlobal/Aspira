// components/login/LoginForm.jsx
import { FormEvent, useState } from "react";
import { Compass, Eye, EyeOff, ArrowRight } from "lucide-react";
import {Link} from "react-router-dom"
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 md:p-10">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-[#1C2B4A] flex items-center justify-center">
          <Compass size={16} className="text-[#F7F5F0]" />
        </div>
        <span className="text-lg font-serif font-bold text-[#121D33]">Aspiria</span>
      </div>

      <h1 className="font-serif font-bold text-3xl text-[#121D33] mb-2">Welcome Back</h1>
      <p className="text-sm text-[#8A93A6] mb-8">
        Don't have an account? <Link to="/signup" className="underline text-[#121D33]">
          Sign Up
        </Link>
      </p>
     

      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg border border-[#8A93A6]/30 text-sm focus:outline-none focus:border-[#E0A63C]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#121D33] mb-2">Password</label>
          <div className="relative">
            <input
            required
            type={showPassword ? "text" : "password"}
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
           {isSubmitting ? "Signing in..." : "Log In"}{" "}
           <ArrowRight size={16} />
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