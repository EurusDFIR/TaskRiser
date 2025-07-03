// Converted from monolithic-core/pages/register.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiCastle } from "react-icons/gi";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!fullName || !username || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong during registration.");
      }
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#221426]/95 via-[#1D1340]/90 to-[#445EF2]/90">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1D1340]/80 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#A480F2] flex items-center">
          <GiCastle className="mr-2" /> Register
        </h2>
        <div className="mb-4">
          <label className="block mb-1 text-[#A480F2]">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent outline-none py-2 px-2 text-[#F2F2F2] border border-[#A480F2]/30 rounded"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[#A480F2]">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent outline-none py-2 px-2 text-[#F2F2F2] border border-[#A480F2]/30 rounded"
            placeholder="Choose a username"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[#A480F2]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent outline-none py-2 px-2 text-[#F2F2F2] border border-[#A480F2]/30 rounded"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mb-4 relative">
          <label className="block mb-1 text-[#A480F2]">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent outline-none py-2 px-2 text-[#F2F2F2] border border-[#A480F2]/30 rounded"
            placeholder="Create a password"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-8 text-[#A480F2]"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="mb-4 relative">
          <label className="block mb-1 text-[#A480F2]">Confirm Password</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent outline-none py-2 px-2 text-[#F2F2F2] border border-[#A480F2]/30 rounded"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-8 text-[#A480F2]"
            tabIndex={-1}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mr-2"
          />
          <span className="text-[#A480F2]">I agree to the Terms of Service and Privacy Policy</span>
        </div>
        {error && <p className="text-sm text-[#d90429]">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[#A480F2] hover:bg-[#8B5CF6] text-white font-bold py-2 px-4 rounded transition duration-200"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
        <div className="flex justify-between mt-4">
          <Link href="/login" className="text-[#A480F2] hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
