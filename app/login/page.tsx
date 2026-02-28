"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center font-mono">
      <div className="w-80 border border-white/5 rounded-lg bg-[#0d0d18] p-8 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">⚡</div>
          <span className="text-sm font-semibold text-indigo-300 tracking-wide">RZP TOOL</span>
        </div>
        <div>
          <label className="text-[10px] text-slate-600 tracking-widest uppercase block mb-1.5">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-600 tracking-widest uppercase block mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          {loading ? "verifying..." : "Login →"}
        </button>
      </div>
    </div>
  );
}