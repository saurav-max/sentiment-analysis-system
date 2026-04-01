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

  .reg-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    background-color: var(--bg);
    overflow: hidden;
  }

  /* Grid lines — pink tint for register */
  .reg-shell::before {
    content: '';
    position: absolute;
    inset: -10%;
    background-image:
      linear-gradient(rgba(255,107,157,.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,107,157,.055) 1px, transparent 1px);
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

  /* Glow blobs */
  .reg-glow {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 50% 40% at 80% 15%, rgba(255,107,157,.12) 0%, transparent 60%),
      radial-gradient(ellipse 45% 35% at 20% 85%, rgba(127,236,204,.10) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Blinking corner dots — pink */
  .grid-dot {
    position: absolute;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent2);
    pointer-events: none;
    animation: blink 3s ease-in-out infinite;
  }
  .grid-dot:nth-child(1) { top: 48px;    left: 48px;    animation-delay: 0s;   }
  .grid-dot:nth-child(2) { top: 48px;    right: 48px;   animation-delay: .9s;  }
  .grid-dot:nth-child(3) { bottom: 48px; left: 48px;    animation-delay: 1.8s; }
  .grid-dot:nth-child(4) { bottom: 48px; right: 48px;   animation-delay: 2.7s; }
  @keyframes blink {
    0%,100% { opacity:.12; transform: scale(1); }
    50%      { opacity:.7;  transform: scale(1.6); box-shadow: 0 0 10px var(--accent2); }
  }

  /* Card */
  .reg-card {
    width: 100%;
    max-width: 420px;
    background: rgba(19,19,30,.82);
    border: 1px solid rgba(255,107,157,.13);
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
      0 0 100px rgba(255,107,157,.05);
    animation: cardIn .55s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(28px) scale(.96); }
    to   { opacity:1; transform: translateY(0)    scale(1);   }
  }
  .reg-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,107,157,.04) 0%, transparent 55%);
    pointer-events: none;
  }
  .reg-card::after {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,107,157,.8), transparent);
  }

  /* Brand */
  .reg-brand {
    display: flex; align-items: center;
    gap: 10px; margin-bottom: 36px;
  }
  .reg-dot {
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
  .reg-brand-name { font-size:18px; font-weight:800; letter-spacing:-.02em; }

  /* Progress steps */
  .reg-steps {
    display: flex; gap: 6px; margin-bottom: 32px;
  }
  .reg-step {
    flex: 1; height: 3px; border-radius: 99px;
    background: var(--border);
    transition: background .3s;
  }
  .reg-step.active { background: var(--accent2); box-shadow: 0 0 8px rgba(255,107,157,.4); }
  .reg-step.done   { background: rgba(255,107,157,.35); }

  .reg-heading {
    font-size: 30px; font-weight: 800;
    line-height: 1.1; letter-spacing: -.03em;
    margin-bottom: 8px;
  }
  .reg-sub {
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
    border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(255,107,157,.1);
  }

  .reg-btn {
    width: 100%;
    background: var(--accent2); color: #fff;
    border: none; border-radius: 12px;
    padding: 16px;
    font-size: 15px; font-weight: 800;
    font-family: var(--sans); letter-spacing: .04em;
    cursor: pointer; margin-top: 8px;
    transition: transform .15s, box-shadow .2s, opacity .15s;
    box-shadow: 0 4px 24px rgba(255,107,157,.28);
  }
  .reg-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255,107,157,.45);
  }
  .reg-btn:active  { transform: translateY(0); opacity:.85; }
  .reg-btn.loading { opacity:.6; cursor:wait; }

  .reg-divider {
    display: flex; align-items: center;
    gap: 12px; margin: 28px 0;
    color: var(--muted); font-size: 12px;
    font-family: var(--mono);
  }
  .reg-divider::before, .reg-divider::after {
    content: ''; flex: 1; height: 1px;
    background: var(--border);
  }

  .reg-footer {
    text-align: center; font-size: 14px;
    color: var(--muted); font-family: var(--mono);
  }
  .reg-footer a {
    color: var(--accent); text-decoration: none;
    font-weight: 700; transition: opacity .15s;
  }
  .reg-footer a:hover { opacity:.75; }

  /* Success */
  .reg-success {
    text-align: center; padding: 16px 0;
    animation: cardIn .4s cubic-bezier(.22,1,.36,1) both;
  }
  .reg-success-icon {
    font-size: 52px; margin-bottom: 16px;
    filter: drop-shadow(0 0 16px rgba(127,236,204,.5));
  }
  .reg-success-title {
    font-size: 24px; font-weight: 800;
    margin-bottom: 8px; color: var(--accent);
  }
  .reg-success-sub {
    font-size: 14px; color: var(--muted);
    font-family: var(--mono); margin-bottom: 28px;
  }
  .reg-success-btn {
    width: 100%;
    background: var(--accent); color: #000;
    border: none; border-radius: 12px;
    padding: 16px;
    font-size: 15px; font-weight: 800;
    font-family: var(--sans); letter-spacing: .04em;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(127,236,204,.28);
    transition: transform .15s, box-shadow .2s;
    text-decoration: none; display: block;
  }
  .reg-success-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(127,236,204,.45);
  }
`;

function Register() {

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const filledCount = [name, email, password].filter(Boolean).length;

  const registerUser = async () => {
    setLoading(true);
    try {

      console.log("Sending data:", { name, email, password });

      const response = await API.post("/users/register", {
        name: name,
        email: email,
        password: password
      });

      console.log("REGISTER RESPONSE:", response.data);

      setSuccess(true);

      setName("");
      setEmail("");
      setPassword("");

    } catch (error) {

      console.log("FULL ERROR OBJECT:", error);

      if (error.response) {
        console.log("SERVER RESPONSE STATUS:", error.response.status);
        console.log("SERVER RESPONSE DATA:", error.response.data);
      }

      alert("Registration Failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="reg-shell">
        <div className="grid-dot" />
        <div className="grid-dot" />
        <div className="grid-dot" />
        <div className="grid-dot" />
        <div className="reg-glow" />

        <div className="reg-card">
          <div className="reg-brand">
            <div className="reg-dot" />
            <span className="reg-brand-name">EmotiSense</span>
          </div>

          {success ? (
            <div className="reg-success">
              <div className="reg-success-icon">✦</div>
              <div className="reg-success-title">You're in!</div>
              <p className="reg-success-sub">Account created successfully</p>
              <Link to="/" className="reg-success-btn">Sign In →</Link>
            </div>
          ) : (
            <>
              <div className="reg-steps">
                <div className={`reg-step ${filledCount >= 1 ? "done" : ""} ${filledCount === 0 ? "active" : ""}`} />
                <div className={`reg-step ${filledCount >= 2 ? "done" : ""} ${filledCount === 1 ? "active" : ""}`} />
                <div className={`reg-step ${filledCount >= 3 ? "done" : ""} ${filledCount === 2 ? "active" : ""}`} />
              </div>

              <h2 className="reg-heading">Create account.</h2>
              <p className="reg-sub">Start analysing emotions today</p>

              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && registerUser()}
                />
              </div>

              <button
                className={`reg-btn${loading ? " loading" : ""}`}
                onClick={registerUser}
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account →"}
              </button>

              <div className="reg-divider">or</div>

              <p className="reg-footer">
                Already have an account?{" "}
                <Link to="/">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Register;