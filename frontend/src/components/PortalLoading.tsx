'use client';

import React from 'react';

export default function PortalLoading() {
  return (
    <div className="portal-loader-wrapper">
      <style>{`
        .portal-loader-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.02) 70%, transparent 100%), #f8fafc;
          color: #0f172a;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          overflow: hidden;
        }

        @media (prefers-color-scheme: dark) {
          .portal-loader-wrapper {
            background: radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 70%, transparent 100%), #090d16;
            color: #f8fafc;
          }
        }

        .portal-loader-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 3rem;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8);
          animation: portal-scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 90vw;
          width: 380px;
          text-align: center;
        }

        @media (prefers-color-scheme: dark) {
          .portal-loader-card {
            background: rgba(15, 23, 42, 0.75);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(51, 65, 85, 0.4);
          }
        }

        .portal-icon-container {
          position: relative;
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .portal-pulse-ring {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid rgba(16, 185, 129, 0.4);
          animation: portal-ripple 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        .portal-pulse-ring-2 {
          position: absolute;
          inset: -18px;
          border-radius: 50%;
          border: 1.5px dashed rgba(14, 165, 233, 0.3);
          animation: portal-spin 12s linear infinite;
        }

        .portal-icon-bg {
          width: 76px;
          height: 76px;
          border-radius: 22px;
          background: linear-gradient(135deg, #10b981 0%, #059669 40%, #0284c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 24px -6px rgba(16, 185, 129, 0.45);
          animation: portal-heartbeat 1.8s ease-in-out infinite;
        }

        .portal-brand-title {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.25rem;
          background: linear-gradient(135deg, #0f172a 30%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-color-scheme: dark) {
          .portal-brand-title {
            background: linear-gradient(135deg, #ffffff 30%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }

        .portal-brand-subtitle {
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .portal-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: portal-blink 1.2s infinite;
        }

        .portal-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(226, 232, 240, 0.7);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          margin-bottom: 1rem;
        }

        @media (prefers-color-scheme: dark) {
          .portal-progress-bar {
            background: rgba(51, 65, 85, 0.6);
          }
        }

        .portal-progress-indicator {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 45%;
          border-radius: 999px;
          background: linear-gradient(90deg, #10b981, #06b6d4, #10b981);
          background-size: 200% 100%;
          animation: portal-indeterminate 1.6s ease-in-out infinite, portal-gradient-shift 2s linear infinite;
        }

        .portal-status-text {
          font-size: 0.78rem;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.01em;
        }

        @keyframes portal-scale-in {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes portal-heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.08); }
          28% { transform: scale(1); }
          42% { transform: scale(1.05); }
          70% { transform: scale(1); }
        }

        @keyframes portal-ripple {
          0% {
            transform: scale(0.85);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes portal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes portal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes portal-indeterminate {
          0% {
            left: -40%;
            width: 30%;
          }
          50% {
            left: 35%;
            width: 55%;
          }
          100% {
            left: 100%;
            width: 30%;
          }
        }

        @keyframes portal-gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <div className="portal-loader-card">
        <div className="portal-icon-container">
          <div className="portal-pulse-ring"></div>
          <div className="portal-pulse-ring-2"></div>
          <div className="portal-icon-bg">
            {/* Medical Cross & Heartbeat Wave SVG */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        <h1 className="portal-brand-title">HealingWave</h1>
        <p className="portal-brand-subtitle">
          <span className="portal-live-dot"></span>
          Hospital Management Portal
        </p>

        <div className="portal-progress-bar">
          <div className="portal-progress-indicator"></div>
        </div>

        <p className="portal-status-text">Loading clinical services &amp; medical records...</p>
      </div>
    </div>
  );
}
