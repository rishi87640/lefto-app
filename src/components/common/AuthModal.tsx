import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [inputValue, setInputValue] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { isConfigured, signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await signInWithOtp(inputValue);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to send verification code. Please verify credentials.');
      } else {
        setIsOtpSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await verifyOtp(inputValue, otp);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid OTP code.');
      } else {
        onClose();
        navigate('/profile');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetState = () => {
    setIsOtpSent(false);
    setOtp('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Login or Sign Up</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Rescue surplus meals across Greater Noida
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-error/10 border border-error/30 text-error p-3 rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-space-md">
            {/* Auth Method Switcher */}
            <div className="flex bg-surface-container-low p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setInputValue('');
                  resetState();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  authMethod === 'phone'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Mobile Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setInputValue('');
                  resetState();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  authMethod === 'email'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Email Address
              </button>
            </div>

            {authMethod === 'phone' ? (
              <div className="flex flex-col gap-1.5">
                <label className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">
                  Enter Mobile Number
                </label>
                <div className="flex items-center gap-space-2xs">
                  <span className="inline-flex items-center justify-center bg-surface-container-high text-on-surface font-bold text-body-md px-space-sm py-2.5 rounded-xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="flex-1 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl px-space-md py-2.5 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm text-primary">sms</span>
                  Instant OTP delivery for order confirmation & pickup pass.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">
                  Enter Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl px-space-md py-2.5 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm text-primary">mail</span>
                  We will send a magic sign-in code to your inbox.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || inputValue.trim().length === 0}
              className="w-full bg-primary-container hover:bg-primary disabled:opacity-50 text-on-primary font-label-button text-label-button py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Get Verification Code</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Continue with Demo Account (Rishi) →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-space-md">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">
                  Enter Verification Code
                </label>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Change Input
                </button>
              </div>
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim().slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-surface-container-low text-on-surface rounded-xl px-space-md py-2.5 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="font-body-sm text-xs text-on-surface-variant text-center mt-1">
                {isConfigured
                  ? 'Check your phone SMS or email inbox for your code.'
                  : 'Demo Mode: Enter any digits or click verify to proceed.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length === 0}
              className="w-full bg-primary-container hover:bg-primary disabled:opacity-50 text-on-primary font-label-button text-label-button py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <span className="material-symbols-outlined text-base">check</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="bg-surface-container-low p-3 rounded-xl text-[11px] text-on-surface-variant leading-relaxed">
          <strong>Database Status:</strong>{' '}
          {isConfigured
            ? 'Supabase Auth enabled. SMS requires Twilio/Gupshup provider configured in Supabase.'
            : 'Running in demo mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live Supabase Auth.'}
        </div>
      </div>
    </div>
  );
};
