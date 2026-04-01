import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0c0c12;
    --surface: #13131e;
    --border:  #ffffff0f;
    --text:    #e8e8f0;
    --muted:   #6b6b88;
    --accent:  #7FECCC;
    --accent2: #FF6B9D;
    --mono:    'Space Mono', monospace;
    --sans:    'Syne', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  .login-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    background-color: var(--bg);
    overflow: hidden;
  }

  .login-shell::before {
    content: '';
    position: absolute;
    inset: -10%;
    background-image:
      linear-gradient(rgba(127,236,204,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(127,236,204,.06) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%);
    pointer-events: none;
    animation: gridShift 20s linear infinite;
  }
  @keyframes gridShift {
    from { transform: translate(0, 0); }
    to   { transform: translate(48px, 48px); }
  }

  .login-glow {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 50% 40% at 20% 20%, rgba(127,236,204,.13) 0%, transparent 60%),
      radial-gradient(ellipse 45% 35% at 80% 80%, rgba(255,107,157,.10) 0%, transparent 60%);
    pointer-events: none;
  }

  .grid-dot {
    position: absolute;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent);
    pointer-events: none;
    animation: blink 3s ease-in-out infinite;
  }
  .grid-dot:nth-child(1) { top: 48px;    left: 48px;    animation-delay: 0s;   }
  .grid-dot:nth-child(2) { top: 48px;    right: 48px;   animation-delay: .9s;  }
  .grid-dot:nth-child(3) { bottom: 48px; left: 48px;    animation-delay: 1.8s; }
  .grid-dot:nth-child(4) { bottom: 48px; right: 48px;   animation-delay: 2.7s; }
  @keyframes blink {
    0%,100% { opacity:.12; transform: scale(1); }
    50%      { opacity:.7;  transform: scale(1.6); box-shadow: 0 0 10px var(--accent); }
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background: rgba(19,19,30,.82);
    border: 1px solid rgba(127,236,204,.13);
    border-radius: 24px;
    padding: 48px 40px;
    position: relative;
    z-index: 1;
    overflow: hidden;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,.04),
      0 32px 64px rgba(0,0,0,.55),
      0 0 100px rgba(127,236,204,.05);
    animation: cardIn .55s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(28px) scale(.96); }
    to   { opacity:1; transform: translateY(0)    scale(1);   }
  }
  .login-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(127,236,204,.04) 0%, transparent 55%);
    pointer-events: none;
  }
  .login-card::after {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(127,236,204,.8), transparent);
  }

  .login-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 36px;
  }
  .login-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(1.5); }
  }
  .login-brand-name {
    font-size: 18px; font-weight: 800; letter-spacing: -.02em;
  }

  .login-heading {
    font-size: 30px; font-weight: 800;
    line-height: 1.1; letter-spacing: -.03em;
    margin-bottom: 8px;
  }
  .login-sub {
    font-size: 14px; color: var(--muted);
    margin-bottom: 36px; font-family: var(--mono);
  }

  .field { margin-bottom: 20px; }
  .field label {
    display: block;
    font-size: 11px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 8px;
    font-family: var(--mono);
  }
  .field input {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 15px; font-family: var(--sans);
    color: var(--text); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .field input::placeholder { color: var(--muted); }
  .field input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(127,236,204,.1);
  }

  .login-btn {
    width: 100%;
    background: var(--accent); color: #000;
    border: none; border-radius: 12px;
    padding: 16px;
    font-size: 15px; font-weight: 800;
    font-family: var(--sans); letter-spacing: .04em;
    cursor: pointer; margin-top: 8px;
    transition: transform .15s, box-shadow .2s, opacity .15s;
    box-shadow: 0 4px 24px rgba(127,236,204,.28);
  }
  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(127,236,204,.45);
  }
  .login-btn:active  { transform: translateY(0); opacity:.85; }
  .login-btn.loading { opacity:.6; cursor:wait; }

  .login-divider {
    display: flex; align-items: center;
    gap: 12px; margin: 28px 0;
    color: var(--muted); font-size: 12px;
    font-family: var(--mono);
  }
  .login-divider::before, .login-divider::after {
    content: ''; flex: 1; height: 1px;
    background: var(--border);
  }

  .login-footer {
    text-align: center; font-size: 14px;
    color: var(--muted); font-family: var(--mono);
  }
  .login-footer a {
    color: var(--accent); text-decoration: none;
    font-weight: 700; transition: opacity .15s;
  }
  .login-footer a:hover { opacity:.75; }
`;

function Login() {

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const loginUser = async () => {
    setLoading(true);
    try {

      console.log(
        "Sending login data:", 
        { email, password }
      );

      const response = await API.post(
        "/users/login", {
        email: email,
        password: password
      });

      console.log(
        "LOGIN RESPONSE:", 
        response.data
      );

      const accessToken =
        response.data.data.accessToken;

      // FIX: sessionStorage! ✅
      // each tab has OWN storage!
      // no overwriting between tabs!
      sessionStorage.setItem(
        "token",
        accessToken
      );

      console.log(
        "Token saved to sessionStorage ✅"
      );

      alert("Login Successful");
      window.location.href = "/dashboard";

    } catch (error) {

      console.log("LOGIN ERROR:", error);

      if (error.response) {
        console.log(
          "SERVER RESPONSE:",
          error.response.data
        );
      }

      alert("Login Failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="login-shell">
        <div className="grid-dot" />
        <div className="grid-dot" />
        <div className="grid-dot" />
        <div className="grid-dot" />
        <div className="login-glow" />

        <div className="login-card">
          <div className="login-brand">
            <div className="login-dot" />
            <span className="login-brand-name">
              EmotiSense
            </span>
          </div>

          <h2 className="login-heading">
            Welcome back.
          </h2>
          <p className="login-sub">
            Sign in to your account
          </p>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => 
                setEmail(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && 
                !loading && 
                loginUser()
              }
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !loading &&
                loginUser()
              }
            />
          </div>

          <button
            className={`login-btn${
              loading ? " loading" : ""
            }`}
            onClick={loginUser}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          <div className="login-divider">or</div>

          <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;