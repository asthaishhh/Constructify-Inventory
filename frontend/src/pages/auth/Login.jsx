import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/layouts/Logo";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function Login() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      data.user.role === "admin" ? navigate("/dashboard") : navigate("/overview");
    } catch (err) {
      setError(err.message || "Login failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; }

        /* ══════════════════════════════════
           OUTER SHELL — true full viewport
        ══════════════════════════════════ */
        .pg {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          min-height: 100dvh;
          font-family: 'Sora', sans-serif;
          overflow: hidden;
        }

        /* ══════════════════════════════════
           LEFT PANEL — decorative / branding
        ══════════════════════════════════ */
        .pg-left {
          flex: 1;
          position: relative;
          background: #07070f;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 3.5rem;
          overflow: hidden;
        }

        /* rich mesh gradient */
        .pg-left::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 90% 70% at -10% 110%, rgba(99,102,241,.55) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 110% -10%, rgba(139,92,246,.40) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50%  50%,  rgba(15,15,35,.9)   0%, transparent 100%);
          pointer-events: none;
        }

        /* grid overlay */
        .pg-left::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* floating orb */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .orb-1 {
          width: 360px; height: 360px;
          background: rgba(99,102,241,.18);
          bottom: -80px; left: -80px;
        }
        .orb-2 {
          width: 260px; height: 260px;
          background: rgba(139,92,246,.14);
          top: 60px; right: -60px;
        }

        .pg-left-top {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 12px;
        }

        .brand-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(99,102,241,.5);
          flex-shrink: 0;
        }
        .brand-icon svg { width: 40px; height: 40px; fill: white; }
        .brand-name {
          font-size: 2rem; font-weight: 700;
          color: #fff; letter-spacing: .01em;
        }

        .pg-left-mid {
          position: relative; z-index: 1;
        }

        .left-tagline {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -.04em;
          margin-bottom: 1.25rem;
        }

        .left-tagline span {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-desc {
          font-size: .95rem;
          color: rgba(255,255,255,.45);
          line-height: 1.65;
          max-width: 380px;
          margin-bottom: 2.5rem;
        }

        /* feature pills */
        .features {
          display: flex; flex-direction: column; gap: .85rem;
        }

        .feat {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: .85rem 1.1rem;
          backdrop-filter: blur(8px);
          transition: background .2s, border-color .2s;
        }
        .feat:hover {
          background: rgba(99,102,241,.08);
          border-color: rgba(99,102,241,.25);
        }

        .feat-icon {
          width: 40px; height: 40px; flex-shrink: 0;
          border-radius: 10px;
          background: rgba(99,102,241,.15);
          display: flex; align-items: center; justify-content: center;
          color: #818cf8;
        }

        .feat-text { display: flex; flex-direction: column; gap: 2px; }
        .feat-title { font-size: .85rem; font-weight: 600; color: rgba(255,255,255,.85); }
        .feat-sub   { font-size: .76rem; color: rgba(255,255,255,.35); }

        .pg-left-btm {
          position: relative; z-index: 1;
          font-size: .75rem;
          color: rgba(255,255,255,.2);
        }

        /* ══════════════════════════════════
           RIGHT PANEL — form
        ══════════════════════════════════ */
        .pg-right {
          width: 480px;
          flex-shrink: 0;
          background: #0d0d18;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.75rem;
          position: relative;
          border-left: 1px solid rgba(255,255,255,.06);
          overflow-y: auto;
        }

        /* subtle inner glow at the seam */
        .pg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(99,102,241,.4), transparent);
          pointer-events: none;
        }

        .form-shell {
          width: 100%;
          max-width: 360px;
          animation: formIn .5s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes formIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .form-head { margin-bottom: 2.25rem; }

        .form-eyebrow {
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #818cf8;
          margin-bottom: .6rem;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -.03em;
          line-height: 1.15;
          margin-bottom: .4rem;
        }

        .form-sub {
          font-size: .85rem;
          color: rgba(255,255,255,.35);
        }

        /* ── Error ── */
        .err {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.22);
          border-radius: 10px;
          padding: .7rem 1rem;
          margin-bottom: 1.25rem;
          animation: shake .35s cubic-bezier(.36,.07,.19,.97);
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        .err-icon {
          flex-shrink: 0; margin-top: 1px;
          width: 17px; height: 17px; border-radius: 50%;
          background: rgba(239,68,68,.18);
          display: flex; align-items: center; justify-content: center;
          color: #f87171; font-size: 10px; font-weight: 800;
        }
        .err-txt { font-size: .8rem; color: #f87171; font-weight: 500; line-height: 1.4; }

        /* ── Fields ── */
        .fields { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.1rem; }

        .field { display: flex; flex-direction: column; gap: .45rem; }

        .flabel {
          font-size: .7rem; font-weight: 700;
          color: rgba(255,255,255,.45);
          letter-spacing: .08em; text-transform: uppercase;
        }

        .fwrap { position: relative; display: flex; align-items: center; }

        .ficon {
          position: absolute; left: 13px;
          color: rgba(255,255,255,.2);
          display: flex; align-items: center;
          pointer-events: none; transition: color .2s; z-index: 1;
        }
        .fwrap.focused .ficon { color: #818cf8; }

        .finput {
          width: 100%;
          padding: .78rem 1rem .78rem 2.6rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 11px;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: .9rem;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          -webkit-appearance: none;
        }
        .finput::placeholder { color: rgba(255,255,255,.18); }
        .finput:focus {
          border-color: rgba(99,102,241,.55);
          background: rgba(99,102,241,.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .finput:-webkit-autofill,
        .finput:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0 1000px #0d0d18 inset;
        }

        .eye-btn {
          position: absolute; right: 11px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.22);
          display: flex; align-items: center; justify-content: center;
          min-width: 36px; min-height: 36px;
          border-radius: 7px;
          transition: color .2s, background .2s;
          touch-action: manipulation; z-index: 1;
        }
        .eye-btn:hover { color: rgba(255,255,255,.6); background: rgba(255,255,255,.05); }

        /* ── Actions row ── */
        .actions {
          display: flex; align-items: center;
          justify-content: space-between;
          flex-wrap: wrap; gap: .5rem;
          margin-bottom: 1.5rem;
        }

        .remember {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; user-select: none; padding: 3px 0;
        }
        .cb {
          width: 16px; height: 16px; border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,.16);
          background: rgba(255,255,255,.04);
          display: flex; align-items: center; justify-content: center;
          transition: border-color .2s, background .2s; flex-shrink: 0;
        }
        .cb.on { border-color: #6366f1; background: #6366f1; }
        .cb svg { width: 9px; height: 9px; stroke: white; stroke-width: 2.5; fill: none; }
        .remember-txt { font-size: .8rem; color: rgba(255,255,255,.4); }

        .forgot {
          font-size: .8rem; color: #818cf8;
          text-decoration: none; font-weight: 500;
          transition: color .2s; padding: 3px 0; white-space: nowrap;
        }
        .forgot:hover { color: #a5b4fc; }

        /* ── Submit ── */
        .sbtn {
          width: 100%;
          padding: .88rem 1rem;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          color: #fff; border: none;
          border-radius: 11px;
          font-family: 'Sora', sans-serif;
          font-size: .92rem; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .15s, box-shadow .2s, opacity .2s;
          box-shadow: 0 4px 24px rgba(99,102,241,.4), 0 1px 3px rgba(0,0,0,.3);
          position: relative; overflow: hidden;
          margin-bottom: 1.5rem;
          min-height: 48px; touch-action: manipulation;
        }
        .sbtn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent);
          transition: left .4s ease;
        }
        .sbtn:hover::before { left: 100%; }
        .sbtn:hover:not(:disabled) {
          box-shadow: 0 6px 32px rgba(99,102,241,.55), 0 2px 6px rgba(0,0,0,.3);
          transform: translateY(-1px);
        }
        .sbtn:active:not(:disabled) { transform: translateY(0); }
        .sbtn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display: inline-flex; }

        /* ── Divider ── */
        .div-row {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 1.25rem;
        }
        .div-line { flex: 1; height: 1px; background: rgba(255,255,255,.07); }
        .div-txt {
          font-size: .68rem; color: rgba(255,255,255,.22);
          font-weight: 600; letter-spacing: .08em;
          text-transform: uppercase; white-space: nowrap;
        }

        /* ── Sign up ── */
        .signup-row {
          text-align: center;
          font-size: .8rem; color: rgba(255,255,255,.32);
        }
        .signup-link {
          color: #818cf8; text-decoration: none;
          font-weight: 700; margin-left: 4px;
          transition: color .2s; display: inline-block; padding: 2px 0;
        }
        .signup-link:hover { color: #a5b4fc; }

        /* ══════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════ */

        /* Tablet — hide left panel, widen right */
        @media (max-width: 900px) {
          .pg { flex-direction: column; }
          .pg-left { display: none; }
          .pg-right {
            width: 100%;
            border-left: none;
            background: #0a0a0f;
            min-height: 100vh;
            min-height: 100dvh;
            padding: 2.5rem 1.75rem;
          }
          .pg-right::before { display: none; }
          /* Add atmospheric bg to right panel when left is hidden */
          .pg-right::after {
            content: '';
            position: fixed; inset: 0;
            background:
              radial-gradient(ellipse 70% 50% at 20% 10%, rgba(99,102,241,.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 80% 90%, rgba(139,92,246,.10) 0%, transparent 60%);
            pointer-events: none; z-index: 0;
          }
          .form-shell { position: relative; z-index: 1; max-width: 420px; }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .pg-right { padding: 2rem 1.25rem; }
          .finput { font-size: 16px; } /* prevent iOS zoom */
          .form-title { font-size: 1.5rem; }
        }

        /* Very small */
        @media (max-width: 360px) {
          .actions { flex-direction: column; align-items: flex-start; gap: .55rem; }
          .pg-right { padding: 1.5rem 1rem; }
        }

        /* Large desktop — show left panel wider */
        @media (min-width: 1280px) {
          .pg-right { width: 520px; padding: 3rem 3.5rem; }
          .left-tagline { font-size: 3.25rem; }
        }

        /* Short screens / landscape mobile */
        @media (max-height: 660px) and (max-width: 900px) {
          .pg-right { align-items: flex-start; padding-top: 1.5rem; }
        }
      `}</style>

      <div className="pg">

        {/* ── LEFT: branding panel ── */}
        <div className="pg-left">
          <div className="orb orb-1"/>
          <div className="orb orb-2"/>

          top brand
          <div className="pg-left-top">
            <Logo className=" brand-icon w-25 h-25"/>
            <span className="brand-name text-xl font-semibold">Constructify</span>
          </div>

          {/* middle: headline + features */}
          <div className="pg-left-mid">
            <h1 className="left-tagline">
              Work smarter,<br/>
              <span>not harder.</span>
            </h1>
            <p className="left-desc">
              Your all-in-one workspace for teams that move fast. Collaborate, ship, and grow — all in one place.
            </p>

            <div className="features">
              <div className="feat">
                <div className="feat-icon"><ShieldIcon/></div>
                <div className="feat-text">
                  <span className="feat-title">Enterprise-grade security</span>
                  <span className="feat-sub">SOC 2 Type II certified · End-to-end encryption</span>
                </div>
              </div>
              <div className="feat">
                <div className="feat-icon"><ZapIcon/></div>
                <div className="feat-text">
                  <span className="feat-title">Blazing fast performance</span>
                  <span className="feat-sub">Real-time sync across all your devices</span>
                </div>
              </div>
              <div className="feat">
                <div className="feat-icon"><GlobeIcon/></div>
                <div className="feat-text">
                  <span className="feat-title">Global collaboration</span>
                  <span className="feat-sub">Trusted by 50,000+ teams in 120 countries</span>
                </div>
              </div>
            </div>
          </div>

          {/* bottom: legal */}
          <div className="pg-left-btm">
            © 2026 Workspace Inc. · Privacy · Terms
          </div>
        </div>

        {/* ── RIGHT: form panel ── */}
        <div className="pg-right">
          <div className="form-shell">
            <div className="form-head">
              <p className="form-eyebrow">Sign in</p>
              <h2 className="form-title">Welcome back</h2>
              <p className="form-sub">Enter your credentials to access your account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="err">
                <div className="err-icon">!</div>
                <span className="err-txt">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="fields">

                {/* Email */}
                <div className="field">
                  <label className="flabel">Email address</label>
                  <div className={`fwrap${focusedField === "email" ? " focused" : ""}`}>
                    <span className="ficon"><MailIcon/></span>
                    <input
                      type="email"
                      className="finput"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <label className="flabel">Password</label>
                  <div className={`fwrap${focusedField === "password" ? " focused" : ""}`}>
                    <span className="ficon"><LockIcon/></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="finput"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="current-password"
                      style={{ paddingRight: "2.75rem" }}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="actions">
                <label className="remember" onClick={() => setRememberMe((v) => !v)}>
                  <div className={`cb${rememberMe ? " on" : ""}`}>
                    {rememberMe && <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>}
                  </div>
                  <input type="checkbox" checked={rememberMe} onChange={() => {}}
                    style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}/>
                  <span className="remember-txt">Remember me</span>
                </label>
                <a href="#" className="forgot">Forgot password?</a>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="sbtn">
                {loading ? (
                  <>
                    <span className="spin">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    </span>
                    Signing in…
                  </>
                ) : "Sign in"}
              </button>

              {/* Divider */}
              <div className="div-row">
                <div className="div-line"/>
                <span className="div-txt">No account yet?</span>
                <div className="div-line"/>
              </div>

              {/* Sign up */}
              <div className="signup-row">
                Don't have an account?
                <Link to="/register-company" className="signup-link">Create one →</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}