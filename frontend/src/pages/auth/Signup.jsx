import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/layouts/Logo";
import { loadCompanyProfile } from "../../utils/companyProfile";
/* ─────────────── SVG Icons ─────────────── */
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const TrendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const ScrollIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ─────────────── Password strength ─────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#6366f1" },
  ];
  return { score, ...map[score] };
}

/* ─────────────── Modal content ─────────────── */
const MODAL_CONTENT = {
  terms: {
    icon: <ScrollIcon />,
    badge: "Legal",
    title: "Terms of Service",
    lastUpdated: "January 1, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using Workspace, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services. These terms apply to all visitors, users, and others who access the service.",
      },
      {
        heading: "2. Use of the Service",
        body: "You may use Workspace only for lawful purposes and in accordance with these Terms. You agree not to use the service to transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. You are responsible for maintaining the confidentiality of your account credentials.",
      },
      {
        heading: "3. User Accounts",
        body: "When you create an account, you must provide accurate, complete, and current information. You are solely responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security. Workspace will not be liable for any loss resulting from unauthorized use of your account.",
      },
      {
        heading: "4. Intellectual Property",
        body: "The service and its original content, features, and functionality are owned by Workspace Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without express written permission.",
      },
      {
        heading: "5. Prohibited Activities",
        body: "You agree not to: (a) use the service for any illegal purpose; (b) attempt to gain unauthorized access to any part of the service; (c) interfere with or disrupt the integrity or performance of the service; (d) scrape, crawl, or spider any content from the service; (e) use automated tools to access the service without our written consent.",
      },
      {
        heading: "6. Termination",
        body: "We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will cease immediately. All provisions which by their nature should survive termination shall survive.",
      },
      {
        heading: "7. Limitation of Liability",
        body: "To the maximum extent permitted by applicable law, Workspace Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the service. Our total liability shall not exceed the amount paid by you in the twelve months prior to the claim.",
      },
      {
        heading: "8. Changes to Terms",
        body: "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or a prominent notice on our website. Your continued use of the service after such changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.",
      },
      {
        heading: "9. Governing Law",
        body: "These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Delaware.",
      },
      {
        heading: "10. Contact Us",
        body: "If you have any questions about these Terms of Service, please contact our legal team at legal@workspace.io or write to us at Workspace Inc., 123 Innovation Drive, Suite 400, Wilmington, DE 19801, United States.",
      },
    ],
  },
  privacy: {
    icon: <ShieldIcon />,
    badge: "Privacy",
    title: "Privacy Policy",
    lastUpdated: "January 1, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information you provide directly, such as your name, email address, and password when you create an account. We also collect usage data, including how you interact with our service, pages visited, features used, and actions taken. Device information such as IP address, browser type, and operating system may also be collected automatically.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "We use collected information to: provide, maintain, and improve the service; send transactional emails and service updates; respond to your comments and questions; monitor usage and detect fraudulent or abusive activity; personalize your experience; and comply with legal obligations. We will never sell your personal information to third parties.",
      },
      {
        heading: "3. Data Sharing",
        body: "We may share your information with trusted third-party service providers who assist us in operating our service (e.g., cloud hosting, analytics, payment processing), subject to confidentiality agreements. We may also disclose information when required by law, in response to legal process, or to protect the rights and safety of our users.",
      },
      {
        heading: "4. Cookies & Tracking",
        body: "We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns. You can control cookie settings through your browser. Disabling cookies may affect the functionality of certain features. We use both session cookies (deleted when you close your browser) and persistent cookies (remain on your device for a set period).",
      },
      {
        heading: "5. Data Security",
        body: "We implement industry-standard security measures including TLS encryption for data in transit, AES-256 encryption for data at rest, regular security audits, and strict access controls. While we strive to protect your data, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.",
      },
      {
        heading: "6. Data Retention",
        body: "We retain your personal information for as long as your account is active or as needed to provide services and comply with legal obligations. You may request deletion of your account and associated data at any time. Some information may be retained in anonymized form for analytical purposes after account deletion.",
      },
      {
        heading: "7. Your Rights",
        body: "Depending on your location, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; object to or restrict processing; data portability; and withdraw consent at any time. To exercise these rights, contact us at privacy@workspace.io.",
      },
      {
        heading: "8. Children's Privacy",
        body: "Our service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have inadvertently collected such information, we will take steps to delete it promptly. Parents or guardians who believe their child has provided us information should contact us immediately.",
      },
      {
        heading: "9. International Transfers",
        body: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission, to protect your information when transferred internationally.",
      },
      {
        heading: "10. Contact & DPO",
        body: "For privacy-related inquiries, contact our Data Protection Officer at privacy@workspace.io. EU residents may also contact our EU representative. You have the right to lodge a complaint with your local supervisory authority if you believe we have not handled your data in accordance with applicable law.",
      },
    ],
  },
};

/* ─────────────── Modal Component ─────────────── */
function LegalModal({ type, onClose }) {
  const content    = MODAL_CONTENT[type];
  const scrollRef  = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 10);
  };

  if (!content) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={`modal-header${scrolled ? " scrolled" : ""}`}>
          <div className="modal-header-left">
            <div className="modal-icon">{content.icon}</div>
            <div>
              <div className="modal-badge">{content.badge}</div>
              <h2 className="modal-title">{content.title}</h2>
              <p className="modal-updated">Last updated: {content.lastUpdated}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" ref={scrollRef} onScroll={handleScroll}>
          <p className="modal-intro">
            Please read this {content.title} carefully before using Workspace. By creating an account,
            you acknowledge that you have read, understood, and agree to be bound by the following terms.
          </p>
          {content.sections.map((s, i) => (
            <div className="modal-section" key={i}>
              <h3 className="modal-section-heading">{s.heading}</h3>
              <p className="modal-section-body">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <p className="modal-footer-note">
            Questions? Email us at{" "}
            <a href={`mailto:${type === "terms" ? "legal" : "privacy"}@workspace.io`}>
              {type === "terms" ? "legal" : "privacy"}@workspace.io
            </a>
          </p>
          <button className="modal-accept-btn" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Main Component ─────────────── */
export default function Signup() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [focused,  setFocused]  = useState(null);
  const [modal,    setModal]    = useState(null); // "terms" | "privacy" | null

  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL || "";
  const [companyAdminEmail, setCompanyAdminEmail] = useState("");

  const strength    = getStrength(password);
  const pwsMatch    = confirm.length > 0 && password === confirm;
  const pwsMismatch = confirm.length > 0 && password !== confirm;

  useEffect(() => {
    const companyEmail = (loadCompanyProfile().email || "").trim().toLowerCase();
    setCompanyAdminEmail(companyEmail);

    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn && companyEmail && !email) {
      setEmail(companyEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Please fill all required fields."); return; }
    if (password !== confirm)          { setError("Passwords do not match."); return; }

    const normalizedEmail = email.toLowerCase().trim();
    const role = normalizedEmail === companyAdminEmail ? "admin" : "user";

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: normalizedEmail, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Signup failed");
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

        /* ══ Shell ══ */
        .sp {
          display: flex; width: 100vw;
          min-height: 100vh; min-height: 100dvh;
          font-family: 'Sora', sans-serif; overflow: hidden;
        }

        /* ══ Left panel ══ */
        .sp-left {
          flex: 1; position: relative; background: #07070f;
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 3rem 3.5rem; overflow: hidden;
        }
        .sp-left::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 90% 70% at 110% 110%, rgba(139,92,246,.50) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at -10% -10%, rgba(99,102,241,.38) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50%  50%,  rgba(15,15,35,.9)   0%, transparent 100%);
          pointer-events: none;
        }
        .sp-left::after {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .sp-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .sp-orb-1 { width: 380px; height: 380px; background: rgba(139,92,246,.18); top: -80px; right: -80px; }
        .sp-orb-2 { width: 280px; height: 280px; background: rgba(99,102,241,.14); bottom: 40px; left: -60px; }

        .sp-brand { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; }
        .sp-brand-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(99,102,241,.5); flex-shrink: 0;
        }
        .sp-brand-icon svg { width: 20px; height: 20px; fill: white; }
        .sp-brand-name { font-size: 2rem; font-weight: 700; color: #fff; letter-spacing: .01em; }

        .sp-mid { position: relative; z-index: 1; }
        .sp-tagline {
          font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -.04em; margin-bottom: 1.25rem;
        }
        .sp-tagline span {
          background: linear-gradient(135deg, #c084fc, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .sp-desc { font-size: .95rem; color: rgba(255,255,255,.42); line-height: 1.65; max-width: 380px; margin-bottom: 2.5rem; }

        .testimonial {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px; padding: 1.4rem 1.5rem; backdrop-filter: blur(8px); margin-bottom: 1.5rem;
        }
        .test-stars { display: flex; gap: 4px; margin-bottom: .85rem; color: #f59e0b; }
        .test-quote { font-size: .88rem; color: rgba(255,255,255,.65); line-height: 1.6; font-style: italic; margin-bottom: 1rem; }
        .test-author { display: flex; align-items: center; gap: 10px; }
        .test-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: .8rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .test-name { font-size: .82rem; font-weight: 600; color: rgba(255,255,255,.8); }
        .test-role { font-size: .74rem; color: rgba(255,255,255,.35); }

        .stats { display: flex; gap: 1.25rem; }
        .stat {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px; padding: .7rem 1rem; flex: 1;
        }
        .stat-icon {
          width: 34px; height: 34px; border-radius: 9px; background: rgba(99,102,241,.15);
          display: flex; align-items: center; justify-content: center; color: #818cf8; flex-shrink: 0;
        }
        .stat-val { font-size: .88rem; font-weight: 700; color: #fff; }
        .stat-lbl { font-size: .7rem; color: rgba(255,255,255,.32); }
        .sp-btm { position: relative; z-index: 1; font-size: .75rem; color: rgba(255,255,255,.2); }

        /* ══ Right panel ══ */
        .sp-right {
          width: 500px; flex-shrink: 0; background: #0d0d18;
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem 2.75rem; position: relative;
          border-left: 1px solid rgba(255,255,255,.06); overflow-y: auto;
        }
        .sp-right::before {
          content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(139,92,246,.4), transparent);
          pointer-events: none;
        }

        .sp-form-shell {
          width: 100%; max-width: 380px;
          animation: formIn .5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .sp-form-head { margin-bottom: 1.75rem; }
        .sp-eyebrow { font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #a78bfa; margin-bottom: .6rem; }
        .sp-title { font-size: 1.7rem; font-weight: 800; color: #fff; letter-spacing: -.03em; line-height: 1.15; margin-bottom: .4rem; }
        .sp-sub { font-size: .85rem; color: rgba(255,255,255,.35); }

        /* Error */
        .sp-err {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.22);
          border-radius: 10px; padding: .7rem 1rem; margin-bottom: 1.1rem;
          animation: shake .35s cubic-bezier(.36,.07,.19,.97);
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }  60% { transform: translateX(-3px); } 80% { transform: translateX(3px); }
        }
        .sp-err-icon {
          flex-shrink: 0; margin-top: 1px; width: 17px; height: 17px; border-radius: 50%;
          background: rgba(239,68,68,.18); display: flex; align-items: center; justify-content: center;
          color: #f87171; font-size: 10px; font-weight: 800;
        }
        .sp-err-txt { font-size: .8rem; color: #f87171; font-weight: 500; line-height: 1.4; }

        /* Fields */
        .sp-fields { display: flex; flex-direction: column; gap: .85rem; margin-bottom: 1rem; }
        .sp-row { display: grid; grid-template-columns: 1fr 1fr; gap: .85rem; }
        .sp-field { display: flex; flex-direction: column; gap: .4rem; }
        .sp-label { font-size: .69rem; font-weight: 700; color: rgba(255,255,255,.42); letter-spacing: .08em; text-transform: uppercase; }
        .sp-fwrap { position: relative; display: flex; align-items: center; }
        .sp-ficon {
          position: absolute; left: 13px; color: rgba(255,255,255,.2);
          display: flex; align-items: center; pointer-events: none; transition: color .2s; z-index: 1;
        }
        .sp-fwrap.focused .sp-ficon { color: #a78bfa; }
        .sp-input {
          width: 100%; padding: .74rem 1rem .74rem 2.55rem;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px; color: #fff; font-family: 'Sora', sans-serif; font-size: .88rem;
          outline: none; transition: border-color .2s, background .2s, box-shadow .2s; -webkit-appearance: none;
        }
        .sp-input::placeholder { color: rgba(255,255,255,.16); }
        .sp-input:focus { border-color: rgba(139,92,246,.55); background: rgba(139,92,246,.06); box-shadow: 0 0 0 3px rgba(139,92,246,.12); }
        .sp-input.valid   { border-color: rgba(34,197,94,.45); }
        .sp-input.invalid { border-color: rgba(239,68,68,.45); }
        .sp-input:-webkit-autofill, .sp-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff; -webkit-box-shadow: 0 0 0 1000px #0d0d18 inset;
        }
        .sp-eye {
          position: absolute; right: 11px; background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center;
          min-width: 34px; min-height: 34px; border-radius: 7px;
          transition: color .2s, background .2s; touch-action: manipulation; z-index: 1;
        }
        .sp-eye:hover { color: rgba(255,255,255,.6); background: rgba(255,255,255,.05); }
        .sp-status {
          position: absolute; display: flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%; font-size: 11px; pointer-events: none; z-index: 1;
        }
        .sp-status.ok  { background: rgba(34,197,94,.15); color: #4ade80; }
        .sp-status.bad { background: rgba(239,68,68,.15);  color: #f87171; }

        /* Strength */
        .pw-strength { margin-top: .5rem; }
        .pw-bars { display: flex; gap: 4px; margin-bottom: .35rem; }
        .pw-bar { flex: 1; height: 3px; border-radius: 99px; background: rgba(255,255,255,.08); transition: background .3s ease; }
        .pw-bar.lit { background: var(--bar-color); }
        .pw-meta { display: flex; justify-content: space-between; align-items: center; }
        .pw-rules { display: flex; gap: 8px; flex-wrap: wrap; }
        .pw-rule { display: flex; align-items: center; gap: 4px; font-size: .68rem; color: rgba(255,255,255,.3); transition: color .2s; }
        .pw-rule.met { color: #4ade80; }
        .pw-rule-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
        .pw-lbl { font-size: .7rem; font-weight: 600; color: var(--bar-color, rgba(255,255,255,.2)); white-space: nowrap; }

        /* Submit */
        .sp-btn {
          width: 100%; padding: .88rem 1rem;
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          color: #fff; border: none; border-radius: 11px;
          font-family: 'Sora', sans-serif; font-size: .92rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .15s, box-shadow .2s, opacity .2s;
          box-shadow: 0 4px 24px rgba(124,58,237,.4), 0 1px 3px rgba(0,0,0,.3);
          position: relative; overflow: hidden;
          margin-bottom: 1.25rem; min-height: 48px; touch-action: manipulation;
        }
        .sp-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent);
          transition: left .4s ease;
        }
        .sp-btn:hover::before { left: 100%; }
        .sp-btn:hover:not(:disabled) { box-shadow: 0 6px 32px rgba(124,58,237,.55), 0 2px 6px rgba(0,0,0,.3); transform: translateY(-1px); }
        .sp-btn:active:not(:disabled) { transform: translateY(0); }
        .sp-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .sp-spin { animation: spin .8s linear infinite; display: inline-flex; }

        /* Terms note */
        .sp-terms { text-align: center; font-size: .74rem; color: rgba(255,255,255,.25); line-height: 1.6; margin-bottom: 1.25rem; }
        .sp-terms-link {
          color: #818cf8; text-decoration: none; font-weight: 600;
          background: none; border: none; cursor: pointer; font-family: 'Sora', sans-serif;
          font-size: .74rem; padding: 0; transition: color .2s;
          border-bottom: 1px dashed rgba(129,140,248,.4);
        }
        .sp-terms-link:hover { color: #a5b4fc; border-bottom-color: rgba(165,180,252,.6); }

        /* Divider */
        .sp-div { display: flex; align-items: center; gap: 12px; margin-bottom: 1.1rem; }
        .sp-div-line { flex: 1; height: 1px; background: rgba(255,255,255,.07); }
        .sp-div-txt { font-size: .68rem; color: rgba(255,255,255,.22); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }

        .sp-signin { text-align: center; font-size: .8rem; color: rgba(255,255,255,.32); }
        .sp-signin-link { color: #818cf8; text-decoration: none; font-weight: 700; margin-left: 4px; transition: color .2s; display: inline-block; padding: 2px 0; }
        .sp-signin-link:hover { color: #a5b4fc; }

        /* ══════════════════════════════════
           MODAL
        ══════════════════════════════════ */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,.75);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.25rem;
          animation: backdropIn .2s ease both;
        }
        @keyframes backdropIn {
          from { opacity: 0; } to { opacity: 1; }
        }

        .modal-box {
          position: relative;
          width: 100%; max-width: 620px;
          max-height: 88vh;
          background: #0f0f1a;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 20px;
          display: flex; flex-direction: column;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.04) inset,
            0 40px 80px rgba(0,0,0,.7),
            0 0 60px rgba(99,102,241,.08);
          animation: modalIn .3s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }

        /* top accent line */
        .modal-box::before {
          content: '';
          position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.7), rgba(99,102,241,.7), transparent);
          border-radius: 0 0 2px 2px;
        }

        /* Header */
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 1.75rem 1.75rem 1.25rem;
          border-bottom: 1px solid transparent;
          transition: border-color .2s;
          position: relative; z-index: 1;
          flex-shrink: 0;
        }
        .modal-header.scrolled {
          border-bottom-color: rgba(255,255,255,.07);
          background: rgba(15,15,26,.95);
          backdrop-filter: blur(12px);
        }

        .modal-header-left { display: flex; align-items: flex-start; gap: 14px; }

        .modal-icon {
          width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px;
          background: linear-gradient(135deg, rgba(99,102,241,.2), rgba(139,92,246,.2));
          border: 1px solid rgba(139,92,246,.25);
          display: flex; align-items: center; justify-content: center;
          color: #a78bfa; margin-top: 2px;
        }

        .modal-badge {
          display: inline-block; font-size: .65rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: #a78bfa; margin-bottom: .3rem;
        }

        .modal-title { font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: -.02em; line-height: 1.2; }
        .modal-updated { font-size: .72rem; color: rgba(255,255,255,.28); margin-top: .2rem; }

        .modal-close {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
          color: rgba(255,255,255,.4); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s, color .2s, border-color .2s;
          margin-left: 1rem;
        }
        .modal-close:hover { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.25); color: #f87171; }

        /* Body */
        .modal-body {
          flex: 1; overflow-y: auto; padding: 0 1.75rem 1rem;
          scrollbar-width: thin; scrollbar-color: rgba(139,92,246,.3) transparent;
        }
        .modal-body::-webkit-scrollbar { width: 5px; }
        .modal-body::-webkit-scrollbar-track { background: transparent; }
        .modal-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,.3); border-radius: 99px; }
        .modal-body::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,.5); }

        .modal-intro {
          font-size: .84rem; color: rgba(255,255,255,.45); line-height: 1.7;
          padding: 1rem 0 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
          margin-bottom: 1.25rem;
        }

        .modal-section { margin-bottom: 1.5rem; }
        .modal-section:last-child { margin-bottom: 0; padding-bottom: .5rem; }

        .modal-section-heading {
          font-size: .82rem; font-weight: 700; color: #a78bfa;
          letter-spacing: .02em; margin-bottom: .5rem;
          display: flex; align-items: center; gap: 8px;
        }
        .modal-section-heading::before {
          content: '';
          display: inline-block; width: 3px; height: 14px;
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 99px; flex-shrink: 0;
        }

        .modal-section-body {
          font-size: .83rem; color: rgba(255,255,255,.5);
          line-height: 1.75;
        }

        /* Footer */
        .modal-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.75rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,.07);
          flex-shrink: 0; gap: 1rem; flex-wrap: wrap;
        }

        .modal-footer-note {
          font-size: .76rem; color: rgba(255,255,255,.28);
        }
        .modal-footer-note a { color: #818cf8; text-decoration: none; font-weight: 500; transition: color .2s; }
        .modal-footer-note a:hover { color: #a5b4fc; }

        .modal-accept-btn {
          padding: .6rem 1.5rem;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: #fff; border: none; border-radius: 9px;
          font-family: 'Sora', sans-serif; font-size: .84rem; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          transition: transform .15s, box-shadow .2s;
          box-shadow: 0 3px 14px rgba(99,102,241,.4);
          touch-action: manipulation;
        }
        .modal-accept-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(99,102,241,.55); }
        .modal-accept-btn:active { transform: translateY(0); }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 960px) {
          .sp { flex-direction: column; }
          .sp-left { display: none; }
          .sp-right {
            width: 100%; border-left: none; background: #0a0a0f;
            min-height: 100vh; min-height: 100dvh; padding: 2.5rem 1.75rem;
          }
          .sp-right::before { display: none; }
          .sp-right::after {
            content: ''; position: fixed; inset: 0;
            background:
              radial-gradient(ellipse 70% 50% at 80% 10%, rgba(139,92,246,.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 20% 90%, rgba(99,102,241,.10)  0%, transparent 60%);
            pointer-events: none; z-index: 0;
          }
          .sp-form-shell { position: relative; z-index: 1; max-width: 440px; }
          .sp-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .sp-right { padding: 2rem 1.25rem; }
          .sp-input { font-size: 16px; }
          .sp-title { font-size: 1.45rem; }
          .sp-row { grid-template-columns: 1fr; }
          .modal-box { border-radius: 16px; max-height: 92vh; }
          .modal-header { padding: 1.25rem 1.25rem 1rem; }
          .modal-body { padding: 0 1.25rem 1rem; }
          .modal-footer { padding: 1rem 1.25rem 1.25rem; }
          .modal-title { font-size: 1.1rem; }
        }

        @media (max-width: 360px) {
          .sp-right { padding: 1.5rem 1rem; }
          .modal-footer { flex-direction: column; align-items: stretch; }
          .modal-accept-btn { text-align: center; }
        }

        @media (min-width: 1280px) {
          .sp-right { width: 540px; padding: 3rem 3.5rem; }
        }

        @media (max-height: 700px) and (max-width: 960px) {
          .sp-right { align-items: flex-start; padding-top: 1.5rem; }
        }
      `}</style>

      <div className="sp">

        {/* ── LEFT ── */}
        <div className="sp-left">
          <div className="sp-orb sp-orb-1"/><div className="sp-orb sp-orb-2"/>
          <div className="sp-brand">
            <Logo className="sp-brand-icon"/>
            <span className="sp-brand-name text-xl font-semibold">Constructify</span>
          </div>
          <div className="sp-mid">
            <h1 className="sp-tagline">Join thousands<br/><span>building together.</span></h1>
            <p className="sp-desc">Start for free and scale as you grow. No credit card required — just bring your ideas.</p>
            <div className="testimonial">
              <div className="test-stars">{[...Array(5)].map((_,i)=><StarIcon key={i}/>)}</div>
              <p className="test-quote">"Workspace transformed how our team collaborates. We shipped 3× faster in our first month — it's indispensable."</p>
              <div className="test-author">
                <div className="test-avatar">AK</div>
                <div><div className="test-name">Arjun Kapoor</div><div className="test-role">CTO at Buildfast</div></div>
              </div>
            </div>
            <div className="stats">
              <div className="stat"><div className="stat-icon"><UsersIcon/></div><div><div className="stat-val">50K+</div><div className="stat-lbl">Teams</div></div></div>
              <div className="stat"><div className="stat-icon"><TrendingIcon/></div><div><div className="stat-val">99.9%</div><div className="stat-lbl">Uptime</div></div></div>
            </div>
          </div>
          <div className="sp-btm">© 2026 Workspace Inc. · Privacy · Terms</div>
        </div>

        {/* ── RIGHT ── */}
        <div className="sp-right">
          <div className="sp-form-shell">
            <div className="sp-form-head">
              <p className="sp-eyebrow">Get started free</p>
              <h2 className="sp-title">Create your account</h2>
              <p className="sp-sub">Set up your workspace in under a minute</p>
            </div>

            {error && (
              <div className="sp-err">
                <div className="sp-err-icon">!</div>
                <span className="sp-err-txt">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="sp-fields">
                {/* Name + Email row */}
                <div className="sp-row">
                  <div className="sp-field">
                    <label className="sp-label">Full name</label>
                    <div className={`sp-fwrap${focused==="name"?" focused":""}`}>
                      <span className="sp-ficon"><UserIcon/></span>
                      <input type="text" className="sp-input" placeholder="Jane Smith"
                        value={name} onChange={e=>setName(e.target.value)}
                        onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} autoComplete="name"/>
                    </div>
                  </div>
                  <div className="sp-field">
                    <label className="sp-label">Email address</label>
                    <div className={`sp-fwrap${focused==="email"?" focused":""}`}>
                      <span className="sp-ficon"><MailIcon/></span>
                      <input type="email" className="sp-input" placeholder="you@example.com"
                        value={email} onChange={e=>setEmail(e.target.value)}
                        onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)} autoComplete="email"/>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="sp-field">
                  <label className="sp-label">Password</label>
                  <div className={`sp-fwrap${focused==="password"?" focused":""}`}>
                    <span className="sp-ficon"><LockIcon/></span>
                    <input type={showPw?"text":"password"} className="sp-input" placeholder="Create a strong password"
                      value={password} onChange={e=>setPassword(e.target.value)}
                      onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                      autoComplete="new-password" style={{paddingRight:"2.75rem"}}/>
                    <button type="button" className="sp-eye" onClick={()=>setShowPw(v=>!v)} tabIndex={-1}
                      aria-label={showPw?"Hide password":"Show password"}>
                      {showPw?<EyeOffIcon/>:<EyeIcon/>}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="pw-strength">
                      <div className="pw-bars">
                        {[1,2,3,4].map(i=>(
                          <div key={i} className={`pw-bar${strength.score>=i?" lit":""}`} style={{"--bar-color":strength.color}}/>
                        ))}
                      </div>
                      <div className="pw-meta">
                        <div className="pw-rules">
                          {[{label:"8+ chars",met:password.length>=8},{label:"Uppercase",met:/[A-Z]/.test(password)},{label:"Number",met:/[0-9]/.test(password)},{label:"Symbol",met:/[^A-Za-z0-9]/.test(password)}].map(r=>(
                            <span key={r.label} className={`pw-rule${r.met?" met":""}`}>
                              <span className="pw-rule-dot"/>{r.label}
                            </span>
                          ))}
                        </div>
                        <span className="pw-lbl" style={{"--bar-color":strength.color}}>{strength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="sp-field">
                  <label className="sp-label">Confirm password</label>
                  <div className={`sp-fwrap${focused==="confirm"?" focused":""}`}>
                    <span className="sp-ficon"><LockIcon/></span>
                    <input type={showCf?"text":"password"}
                      className={`sp-input${pwsMatch?" valid":pwsMismatch?" invalid":""}`}
                      placeholder="Repeat your password"
                      value={confirm} onChange={e=>setConfirm(e.target.value)}
                      onFocus={()=>setFocused("confirm")} onBlur={()=>setFocused(null)}
                      autoComplete="new-password" style={{paddingRight:"5rem"}}/>
                    {confirm.length>0 && (
                      <span className={`sp-status${pwsMatch?" ok":" bad"}`} style={{right:"42px"}}>
                        {pwsMatch?<CheckIcon/>:<XIcon/>}
                      </span>
                    )}
                    <button type="button" className="sp-eye" onClick={()=>setShowCf(v=>!v)} tabIndex={-1}
                      aria-label={showCf?"Hide password":"Show password"}>
                      {showCf?<EyeOffIcon/>:<EyeIcon/>}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="sp-btn">
                {loading?(
                  <><span className="sp-spin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  </span>Creating account…</>
                ):"Create account"}
              </button>

              {/* Terms note with clickable links */}
              <p className="sp-terms">
                By creating an account you agree to our{" "}
                <button type="button" className="sp-terms-link" onClick={()=>setModal("terms")}>
                  Terms of Service
                </button>
                {" "}and{" "}
                <button type="button" className="sp-terms-link" onClick={()=>setModal("privacy")}>
                  Privacy Policy
                </button>.
              </p>

              <div className="sp-div">
                <div className="sp-div-line"/>
                <span className="sp-div-txt">Have an account?</span>
                <div className="sp-div-line"/>
              </div>
              <div className="sp-signin">
                Already have an account?
                <Link to="/login" className="sp-signin-link">Sign in →</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && <LegalModal type={modal} onClose={()=>setModal(null)}/>}
    </>
  );
}