import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("test123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3002/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      onLogin(response.data.token);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
      <form onSubmit={handleSubmit}>
        <h2>Fleet Monitor</h2>
        <p>Sign In</p>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
          Test credentials: admin@test.com / test123
        </p>
      </form>
    </div>
  );
}

export default Login;
