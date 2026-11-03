import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [surfacing, setSurfacing] = useState(false); // ✅ marine login transition

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.login({ username, password });
      const { token, user } = res.data.data;

      // Save token and user to localStorage
      localStorage.setItem("merobase_token", token);
      localStorage.setItem("merobase_user", JSON.stringify(user));

      // ✅ Play the marine "surfacing" transition, then route to the dashboard.
      // The timeout can't get stuck — it always navigates after the animation.
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reduceMotion) {
        navigate("/dashboard");
      } else {
        setSurfacing(true);
        setTimeout(() => navigate("/dashboard"), 1600);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
      setLoading(false);
    }
    // note: on success we intentionally keep `loading` true so the button
    // stays disabled while the overlay plays (no finally → no early reset).
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-green-50 relative overflow-hidden">
      {/* ================= KEYFRAMES ================= */}
      <style>{`
        @keyframes merobaseRipple {
          0%   { transform: scale(0.2); opacity: 0.55; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes merobaseSurface {
          0%   { opacity: 0; transform: translateY(18px) scale(0.96); letter-spacing: 0.35em; }
          55%  { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 0.08em; }
        }
        @keyframes merobaseBubble {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          15%  { opacity: 0.7; }
          100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
        }
        @keyframes merobaseOverlayIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes merobaseOverlayOut {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ================= LOGIN CARD ================= */}
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          MEROBase Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          MeroBase Sample Database
        </p>
      </div>

      {/* ================= MARINE SURFACING OVERLAY ================= */}
      {surfacing && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #0E7490 0%, #0C4A6E 55%, #082F49 100%)",
            animation: "merobaseOverlayIn 0.4s ease forwards, merobaseOverlayOut 0.45s ease 1.15s forwards",
          }}
        >
          {/* concentric ripples */}
          <div className="absolute" style={{ width: 160, height: 160 }}>
            {[0, 0.4, 0.8].map((delay, i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border"
                style={{
                  borderColor: "rgba(255,255,255,0.5)",
                  animation: `merobaseRipple 1.6s ease-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>

          {/* rising bubbles */}
          {[
            { left: "42%", size: 8,  delay: 0.1 },
            { left: "54%", size: 5,  delay: 0.5 },
            { left: "48%", size: 11, delay: 0.3 },
            { left: "58%", size: 6,  delay: 0.7 },
            { left: "38%", size: 4,  delay: 0.6 },
          ].map((b, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: b.left,
                bottom: "42%",
                width: b.size,
                height: b.size,
                background: "rgba(255,255,255,0.55)",
                animation: `merobaseBubble 1.5s ease-in ${b.delay}s infinite`,
              }}
            />
          ))}

          {/* wordmark surfacing */}
          <div className="relative text-center">
            <h2
              className="text-white font-bold text-4xl"
              style={{ animation: "merobaseSurface 1s ease-out forwards" }}
            >
              MEROBase
            </h2>
            <p
              className="text-cyan-100 text-sm mt-2 tracking-widest uppercase"
              style={{ animation: "merobaseSurface 1s ease-out 0.15s both" }}
            >
              Diving in…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}