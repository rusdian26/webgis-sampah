import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-700">EcoWaste WebGIS</h2>
          <p className="text-gray-500 mt-2">Masuk ke akun Anda</p>
        </div>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: warga@test.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-500">
          Gunakan akun test:<br/>
          warga@test.com | admin@test.com | transporter@test.com<br/>
          (Password: password123)
        </div>
      </div>
    </div>
  );
}