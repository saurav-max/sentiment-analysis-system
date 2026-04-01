import React, { useEffect, useState, useRef } from "react";
import API from "../api/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/* ── Emotion metadata ───────────────────────────────────────── */
const EMOTION_META = {
  joy:      { color: "#FFD166", icon: "✦", glow: "#FFD16655" },
  sadness:  { color: "#74B3CE", icon: "◈", glow: "#74B3CE55" },
  anger:    { color: "#EF476F", icon: "▲", glow: "#EF476F55" },
  fear:     { color: "#9B5DE5", icon: "◆", glow: "#9B5DE555" },
  surprise: { color: "#06D6A0", icon: "★", glow: "#06D6A055" },
  disgust:  { color: "#F77F00", icon: "◉", glow: "#F77F0055" },
  neutral:  { color: "#A0A0B0", icon: "○", glow: "#A0A0B055" },
};

const getEmotionMeta = (pred = "") => {
  const key = pred.toLowerCase();
  return EMOTION_META[key] || {
    color: "#C8C8D8",
    icon: "◌",
    glow: "#C8C8D855"
  };
};

/* ── Styles ─────────────────────────────────────────────────── */
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

  .db-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--bg);
    overflow-x: hidden;
  }

  .db-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 36px;
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0; z-index: 100;
    background: rgba(12,12,18,.88);
  }
  .db-logo {
    font-size: 18px; font-weight: 800;
    letter-spacing: -.02em;
    display: flex; align-items: center; gap: 10px;
  }
  .db-logo-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(1.5); }
  }
  .db-user-chip {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 40px;
    padding: 8px 16px 8px 10px;
    font-size: 13px; color: var(--muted);
    font-family: var(--mono);
  }
  .db-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #000;
    flex-shrink: 0;
  }

  .ws-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-family: var(--mono);
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 40px;
    padding: 6px 14px;
  }
  .ws-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: pulse 1.8s ease-in-out infinite;
  }

  .db-main {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 36px;
    max-width: 1320px;
    width: 100%;
    margin: 0 auto;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    transition: border-color .25s;
  }
  .card:hover { border-color: #ffffff1a; }
  .card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #ffffff04 0%, transparent 60%);
    pointer-events: none;
  }
  .card-label {
    font-size: 11px; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 24px;
    display: flex; align-items: center; gap: 8px;
  }
  .card-label::before {
    content: '';
    display: block; width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
  }

  .predict-card { grid-column: 1 / -1; }
  .predict-inner {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px; align-items: flex-end;
  }
  .input-wrap label {
    display: block;
    font-size: 12px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 10px;
    font-family: var(--mono);
  }
  .text-input {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    font-size: 16px; font-family: var(--sans);
    color: var(--text); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .text-input::placeholder { color: var(--muted); }
  .text-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(127,236,204,.12);
  }
  .predict-btn {
    background: var(--accent); color: #000;
    border: none; border-radius: 12px;
    padding: 16px 28px;
    font-size: 14px; font-weight: 800;
    font-family: var(--sans); letter-spacing: .04em;
    cursor: pointer; white-space: nowrap;
    transition: transform .15s, box-shadow .15s, opacity .15s;
    box-shadow: 0 4px 24px rgba(127,236,204,.25);
  }
  .predict-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(127,236,204,.4);
  }
  .predict-btn:active { transform: translateY(0); opacity:.85; }
  .predict-btn:disabled { opacity:.5; cursor:wait; transform:none; }
  .predict-btn.loading {
    background: linear-gradient(90deg, var(--accent), #a8f0de, var(--accent));
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
  }
  @keyframes shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  .result-card {
    grid-column: 1 / -1;
    border-color: var(--em-color, var(--border));
    box-shadow: 0 0 40px var(--em-glow, transparent);
    transition: border-color .4s, box-shadow .4s;
  }
  .live-tag {
    position: absolute; top: 20px; right: 24px;
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
    color: var(--accent); font-family: var(--mono);
  }
  .live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
    animation: pulse 1.2s ease-in-out infinite;
  }
  .result-inner { display: flex; align-items: center; gap: 32px; }
  .result-icon {
    font-size: 64px; line-height: 1;
    color: var(--em-color, var(--accent));
    filter: drop-shadow(0 0 16px var(--em-glow, transparent));
    animation: iconIn .4s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes iconIn {
    from { transform: scale(.4) rotate(-20deg); opacity:0; }
    to   { transform: scale(1)  rotate(0deg);   opacity:1; }
  }
  .result-body { flex: 1; }
  .result-tag {
    font-size: 11px; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 6px;
    font-family: var(--mono);
  }
  .result-emotion {
    font-size: 42px; font-weight: 800;
    color: var(--em-color, var(--text));
    line-height: 1; margin-bottom: 16px;
    text-transform: capitalize;
  }
  .conf-bar-wrap { display: flex; align-items: center; gap: 14px; }
  .conf-bar-track {
    flex: 1; height: 6px;
    background: rgba(255,255,255,.07);
    border-radius: 99px; overflow: hidden;
  }
  .conf-bar-fill {
    height: 100%; border-radius: 99px;
    background: var(--em-color, var(--accent));
    box-shadow: 0 0 8px var(--em-glow, transparent);
    transition: width .7s cubic-bezier(.4,0,.2,1);
    width: var(--conf-pct, 0%);
  }
  .conf-label {
    font-size: 13px; font-weight: 700;
    font-family: var(--mono);
    color: var(--em-color, var(--text));
    min-width: 44px; text-align: right;
  }

  .history-card { grid-column: 1 / -1; }
  .history-empty {
    text-align: center; color: var(--muted);
    font-size: 14px; padding: 48px 0;
    font-family: var(--mono);
  }
  .hist-table { width: 100%; border-collapse: collapse; }
  .hist-table thead th {
    font-size: 11px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
    color: var(--muted); font-family: var(--mono);
    padding: 0 16px 16px; text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .hist-table tbody tr {
    transition: background .15s;
    animation: rowIn .3s ease both;
  }
  @keyframes rowIn {
    from { opacity:0; transform: translateY(6px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .hist-table tbody tr:hover { background: rgba(255,255,255,.03); }
  .hist-table tbody tr:not(:last-child) td { border-bottom: 1px solid var(--border); }
  .hist-table td {
    padding: 14px 16px; font-size: 14px;
    color: var(--text); vertical-align: middle;
  }
  .hist-text {
    white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; max-width: 280px;
    display: block; color: var(--muted); font-size: 13px;
  }
  .em-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 40px;
    font-size: 12px; font-weight: 700;
    text-transform: capitalize;
    font-family: var(--mono); border: 1px solid;
  }
  .conf-pill {
    font-family: var(--mono);
    font-size: 13px; font-weight: 700;
  }
  .ts {
    font-family: var(--mono);
    font-size: 12px; color: var(--muted);
    white-space: nowrap;
  }

  .logout-btn {
    background: transparent;
    border: 1px solid rgba(255,107,157,.3);
    color: rgba(255,107,157,.8);
    border-radius: 10px; padding: 10px 20px;
    font-size: 13px; font-weight: 700;
    font-family: var(--sans); cursor: pointer;
    letter-spacing: .05em; transition: all .2s;
  }
  .logout-btn:hover {
    background: rgba(255,107,157,.08);
    border-color: rgba(255,107,157,.7);
    color: var(--accent2);
  }

  @media (max-width: 768px) {
    .db-main {
      grid-template-columns: 1fr;
      padding: 20px; gap: 16px;
    }
    .predict-inner { grid-template-columns: 1fr; }
    .result-inner { flex-direction: column; text-align: center; }
    .db-topbar { padding: 16px 20px; }
    .ws-badge span { display: none; }
  }
`;

/* ── Component ──────────────────────────────────────────────── */
function Dashboard() {

  const [email, setEmail]           = useState("");
  const [text, setText]             = useState("");
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);

  // ADD THIS! ✅
  const wsConnected = useRef(false);

  useEffect(() => {
    fetchProfile();
    fetchHistory();

    // small delay to ensure
    // token is ready!
    setTimeout(() => {
        if (!wsConnected.current) {
            wsConnected.current = true;
            connectWebSocket();
        }
    }, 500); // wait 500ms! ✅

}, []);

  /* ── Profile ── */
  const fetchProfile = async () => {
    try {
      const response = await
        API.get("/users/profile");
      setEmail(response.data.data);
    } catch (error) {
      console.log(error);
      alert("Unauthorized");
    }
  };

  /* ── History ── */
  const fetchHistory = async () => {
    try {
      const response = await
        API.get("/ai/history");
      setHistory(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  /* ── WebSocket ── */
  const connectWebSocket = () => {

    // GET TOKEN FIRST! ✅
    const token = sessionStorage
        .getItem("token");

    // LOG IT! ✅
    console.log(
        "WebSocket token:",
        token ? "EXISTS ✅" : "NULL ❌"
    );

    const socket = new SockJS(
    "http://192.168.137.1:8080/ws"
);

    const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log(str),

        // USE token variable! ✅
        connectHeaders: token ? {
            Authorization: "Bearer " + token
        } : {}
    });

    client.onConnect = () => {
        console.log("WebSocket Connected ✅");

        client.subscribe(
            "/user/queue/predictions",
            (message) => {

                // ADD LOG! ✅
                console.log(
                    "RAW received:",
                    message.body
                );

                const result = JSON.parse(
                    message.body
                );

                console.log(
                    "Prediction received:",
                    result
                );

                setPrediction(result.prediction);
                setConfidence(result.confidence);
                setHistory(prev => 
                    [result, ...prev]
                );
                setLoading(false); // ✅
            }
        );
    };

    client.onStompError = (frame) => {
        console.log(
            "WebSocket Error:",
            frame
        );
    };

    client.activate();
};
  /* ── Prediction ── */
  const getPrediction = async () => {

    if (!text || text.trim() === "") {
      alert("Please enter text");
      return;
    }

    // prevent double submit!
    if (loading) return;

    try {
      setLoading(true);

      const encodedText =
        encodeURIComponent(text.trim());

      const response = await API.post(
        "/ai/predict?text=" + encodedText
      );

      console.log(
        "Job submitted!",
        "Remaining:",
        response.data.remainingRequests
      );

      // clear text after submit!
      setText("");

      // DON'T setLoading(false) here!
      // wait for WebSocket result!
      // loading disabled until result comes!

    } catch (error) {
      console.log(
        "Error:",
        error.response?.status,
        error.response?.data
      );

      if (error.response?.status === 429) {
        alert(
          "⏳ Too many requests!\n" +
          "Please wait 60 seconds!"
        );
      } else if (
        error.response?.status === 401) {
        alert("Session expired! Login again!");
        // FIX: sessionStorage! ✅
        sessionStorage.removeItem("token");
        window.location.href = "/";
      } else {
        alert(
          error.response?.data?.message
          || "Something went wrong!"
        );
      }

      // re-enable on error!
      setLoading(false);
    }
  };

  /* ── Logout ── */
  const logout = () => {
    // FIX: sessionStorage! ✅
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  /* ── Derived values ── */
  const em           = getEmotionMeta(prediction);
  const confNum      = parseFloat(confidence) || 0;
  const confPct      = confNum > 1 ? confNum : confNum * 100;
  const avatarLetter = email ? email[0].toUpperCase() : "?";

  const formatDate = (raw) => {
    try {
      return new Date(raw).toLocaleString(
        "en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return raw; }
  };

  /* ── Render ── */
  return (
    <>
      <style>{styles}</style>

      <div className="db-shell">

        {/* Topbar */}
        <header className="db-topbar">
          <div className="db-logo">
            <div className="db-logo-dot" />
            EmotiSense
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            <div className="ws-badge">
              <div className="ws-dot" />
              <span>Live</span>
            </div>
            <div className="db-user-chip">
              <div className="db-avatar">
                {avatarLetter}
              </div>
              {email || "—"}
            </div>
            <button
              className="logout-btn"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Main grid */}
        <main className="db-main">

          {/* Predict card */}
          <div className="card predict-card">
            <div className="card-label">
              Emotion Analysis
            </div>
            <div className="predict-inner">
              <div className="input-wrap">
                <label>Your text</label>
                <input
                  className="text-input"
                  type="text"
                  placeholder="Type something and discover the emotion within…"
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !loading &&
                    getPrediction()
                  }
                  disabled={loading}
                />
              </div>
              <button
                className={`predict-btn${
                  loading ? " loading" : ""
                }`}
                onClick={getPrediction}
                disabled={loading}
              >
                {loading
                  ? "Analyzing…"
                  : "Predict →"
                }
              </button>
            </div>
          </div>

          {/* Result card */}
          {prediction && (
            <div
              className="card result-card"
              style={{
                "--em-color": em.color,
                "--em-glow":  em.glow,
                "--conf-pct": `${confPct.toFixed(1)}%`,
              }}
            >
              <div className="live-tag">
                <div className="live-dot" />
                WebSocket
              </div>
              <div className="card-label">
                Result
              </div>
              <div className="result-inner">
                <div className="result-icon">
                  {em.icon}
                </div>
                <div className="result-body">
                  <div className="result-tag">
                    Detected emotion
                  </div>
                  <div className="result-emotion">
                    {prediction}
                  </div>
                  <div className="conf-bar-wrap">
                    <div className="conf-bar-track">
                      <div className="conf-bar-fill" />
                    </div>
                    <span className="conf-label">
                      {confPct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History card */}
          <div className="card history-card">
            <div className="card-label">
              Prediction History
            </div>

            {history.length === 0 ? (
              <div className="history-empty">
                No predictions yet — run your
                first analysis above
              </div>
            ) : (
              <table className="hist-table">
                <thead>
                  <tr>
                    <th>Text</th>
                    <th>Emotion</th>
                    <th>Confidence</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => {
                    const m = getEmotionMeta(
                      item.prediction
                    );
                    const cp = parseFloat(
                      item.confidence
                    ) || 0;
                    const pct = cp > 1
                      ? cp
                      : cp * 100;
                    return (
                      <tr
                        key={`${item.id}-${i}`}
                        style={{
                          animationDelay:
                            `${i * 40}ms`
                        }}
                      >
                        <td>
                          <span
                            className="hist-text"
                            title={item.inputText}
                          >
                            {item.inputText}
                          </span>
                        </td>
                        <td>
                          <span
                            className="em-badge"
                            style={{
                              color: m.color,
                              borderColor:
                                m.color + "44",
                              background: m.glow,
                            }}
                          >
                            {m.icon} {item.prediction}
                          </span>
                        </td>
                        <td>
                          <span
                            className="conf-pill"
                            style={{ color: m.color }}
                          >
                            {pct.toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <span className="ts">
                            {formatDate(item.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>
    </>
  );
}

export default Dashboard;