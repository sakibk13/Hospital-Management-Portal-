'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import '../../../../components/styles/Toast.css';

const ToastContext = createContext(null);

// Global dispatcher ref to allow non-hook imperative calls like `toast.success(...)`
let globalToastDispatcher = null;

export const toast = {
  success: (message, options = {}) => {
    if (globalToastDispatcher) {
      return globalToastDispatcher.addToast({
        type: 'success',
        title: typeof options === 'string' ? options : (options.title || 'Success'),
        message,
        duration: options.duration ?? 4500,
        sound: options.sound ?? true,
        ...options
      });
    } else {
      console.log('[Toast Success]:', message);
    }
  },
  error: (message, options = {}) => {
    if (globalToastDispatcher) {
      return globalToastDispatcher.addToast({
        type: 'error',
        title: typeof options === 'string' ? options : (options.title || 'Error Encountered'),
        message,
        duration: options.duration ?? 5500,
        sound: options.sound ?? true,
        ...options
      });
    } else {
      console.error('[Toast Error]:', message);
    }
  },
  info: (message, options = {}) => {
    if (globalToastDispatcher) {
      return globalToastDispatcher.addToast({
        type: 'info',
        title: typeof options === 'string' ? options : (options.title || 'Information'),
        message,
        duration: options.duration ?? 4500,
        sound: options.sound ?? false,
        ...options
      });
    } else {
      console.info('[Toast Info]:', message);
    }
  },
  warning: (message, options = {}) => {
    if (globalToastDispatcher) {
      return globalToastDispatcher.addToast({
        type: 'warning',
        title: typeof options === 'string' ? options : (options.title || 'Warning'),
        message,
        duration: options.duration ?? 5000,
        sound: options.sound ?? false,
        ...options
      });
    } else {
      console.warn('[Toast Warning]:', message);
    }
  },
  dismiss: (id) => {
    if (globalToastDispatcher) {
      globalToastDispatcher.removeToast(id);
    }
  }
};

// Play audio safely
const playAudio = (path) => {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio(path);
    audio.volume = 0.45;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be blocked by browser; suppress error silently
      });
    }
  } catch (e) {
    // Ignore audio errors
  }
};

// Clean inline SVGs for crisp rendering without external icon font latency
const SuccessIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ToastItem = ({ toastItem, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toastItem.duration || 4500);

  const startDismissTimer = useCallback(() => {
    if (!toastItem.duration || toastItem.duration <= 0) return;
    startTimeRef.current = Date.now();
  }, [toastItem.duration]);

  const handleClose = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onRemove(toastItem.id);
    }, 240);
  }, [exiting, onRemove, toastItem.id]);

  useEffect(() => {
    if (!toastItem.duration || toastItem.duration <= 0) return;

    startDismissTimer();

    const interval = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = remainingTimeRef.current - elapsed;

      if (remaining <= 0) {
        setProgress(0);
        clearInterval(interval);
        handleClose();
      } else {
        const pct = (remaining / toastItem.duration) * 100;
        setProgress(Math.max(0, Math.min(100, pct)));
      }
    }, 40);

    return () => clearInterval(interval);
  }, [toastItem.duration, isPaused, handleClose, startDismissTimer]);

  const handleMouseEnter = () => {
    if (!toastItem.duration || toastItem.duration <= 0) return;
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (!toastItem.duration || toastItem.duration <= 0) return;
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  const renderIcon = () => {
    switch (toastItem.type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const badgeText = () => {
    switch (toastItem.type) {
      case 'success':
        return 'SUCCESS';
      case 'error':
        return 'ERROR';
      case 'warning':
        return 'ALERT';
      default:
        return 'NOTICE';
    }
  };

  return (
    <div
      className={`hw-toast hw-toast--${toastItem.type} ${exiting ? 'hw-toast-exiting' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="assertive"
    >
      <div className="hw-toast-body">
        <div className="hw-toast-icon-box">
          {renderIcon()}
        </div>

        <div className="hw-toast-content">
          <div className="hw-toast-header-row">
            <span className="hw-toast-badge">{badgeText()}</span>
            <h4 className="hw-toast-title">{toastItem.title}</h4>
          </div>
          <p className="hw-toast-message">{toastItem.message}</p>
        </div>

        <button
          className="hw-toast-close"
          onClick={handleClose}
          aria-label="Dismiss notification"
        >
          <CloseIcon />
        </button>
      </div>

      {toastItem.duration > 0 && (
        <div className="hw-toast-progress-track">
          <div
            className="hw-toast-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, ...toastData };

    if (newToast.sound) {
      if (newToast.type === 'success') {
        playAudio('/assets/success.mp3');
      } else if (newToast.type === 'error') {
        playAudio('/assets/error.mp3');
      }
    }

    setToasts((prev) => [newToast, ...prev.slice(0, 5)]); // limit max 6 toasts
    return id;
  }, []);

  // Register global dispatcher so non-hook code can call `toast.success(...)`
  useEffect(() => {
    globalToastDispatcher = { addToast, removeToast };

    // Intercept native window.alert to provide professional hospital toasts across all pages
    if (typeof window !== 'undefined') {
      window.toast = toast;
      window.showToast = toast;

      if (!window.__originalAlert) {
        window.__originalAlert = window.alert;
        window.alert = (msg) => {
          const str = String(msg || '');
          const lower = str.toLowerCase();
          if (lower.includes('success') || lower.includes('booked') || lower.includes('completed')) {
            toast.success(str);
          } else if (
            lower.includes('fail') ||
            lower.includes('error') ||
            lower.includes('invalid') ||
            lower.includes('check your')
          ) {
            toast.error(str);
          } else {
            toast.info(str);
          }
        };
      }
    }

    return () => {
      globalToastDispatcher = null;
    };
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="hw-toast-container" aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} toastItem={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return { toast };
  }
  return context;
};

export default ToastProvider;
