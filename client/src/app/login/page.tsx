"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Head from "next/head"; // Not needed in App Router
import Link from "next/link";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { FaGithub } from "react-icons/fa";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from "react-icons/fa";
import { GiSpikedDragonHead } from "react-icons/gi";
import {
  BsShieldLockFill,
  BsPersonBadgeFill,
  BsLightningChargeFill,
  BsExclamationOctagonFill,
} from "react-icons/bs";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionError = searchParams?.get?.("session");
    if (sessionError === "expired" || sessionError === "invalid") {
      toast.error("Session expired or invalid. Please log in again.", {
        style: {
          background: "#111827",
          color: "#e5e7eb",
          border: "1px solid #374151",
        },
        icon: <BsExclamationOctagonFill className="text-[#0077b6]" />,
      });
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return;
    }
    if (!sessionError) {
      const token = localStorage.getItem("authToken");
      if (token) {
        router.push("/dashboard");
      }
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const toastStyle = {
      background: "#111827",
      color: "#e5e7eb",
      border: "1px solid #374151",
    };
    if (!identifier || !password) {
      toast.error("Hunter ID and Authentication Code required.", {
        style: toastStyle,
      });
      setLoading(false);
      return;
    }
    try {
      const loginPayload = {
        email: identifier,
        password,
      };
      // Sửa endpoint gọi qua API Gateway
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      }).catch((err) => {
        console.error("Network error:", err);
        toast.error("Không thể kết nối tới API Gateway.", {
          style: toastStyle,
        });
        setLoading(false);
        return null;
      });
      if (!res) return;
      let data: { error?: string; message?: string; access_token?: string } =
        {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Không parse được JSON từ response:", jsonErr);
        toast.error("Lỗi phản hồi từ server.", { style: toastStyle });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        if (data.error === "database_error") {
          toast.error("Database connection error.", { style: toastStyle });
        } else {
          toast.error(data.message || "Login failed.", { style: toastStyle });
        }
        setLoading(false);
        return;
      }
      if (!data.access_token) {
        toast.error("Đăng nhập thất bại: Không nhận được access_token.", {
          style: toastStyle,
        });
        setLoading(false);
        return;
      }
      // Lưu token và chuyển hướng
      localStorage.setItem("authToken", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      console.error("Lỗi không xác định:", err);
      toast.error("An error occurred. Please try again.", {
        style: toastStyle,
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#221426]/95 via-[#1D1340]/90 to-[#445EF2]/90">
      {/* Head removed: use metadata or layout for title in App Router */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1D1340]/80 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#A480F2] flex items-center">
          <GiSpikedDragonHead className="mr-2" /> System Access
        </h2>
        <div className="mb-4">
          <label className="block mb-1 text-[#A480F2]">
            Hunter ID or Email
          </label>
          <div className="flex items-center border border-[#A480F2]/30 rounded px-2">
            <BsPersonBadgeFill className="mr-2 text-[#A480F2]" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-transparent outline-none py-2 text-[#F2F2F2]"
              placeholder="Enter your email or Hunter ID"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[#A480F2]">
            Authentication Code
          </label>
          <div className="flex items-center border border-[#A480F2]/30 rounded px-2">
            <BsShieldLockFill className="mr-2 text-[#A480F2]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none py-2 text-[#F2F2F2]"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-[#A480F2]"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <span className="text-[#A480F2]">Remember me</span>
        </div>
        <button
          type="submit"
          className="w-full bg-[#A480F2] hover:bg-[#8B5CF6] text-white font-bold py-2 px-4 rounded transition duration-200"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="flex justify-between mt-4">
          <Link href="/register" className="text-[#A480F2] hover:underline">
            Register
          </Link>
          <Link href="/" className="text-[#A480F2] hover:underline">
            Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}
