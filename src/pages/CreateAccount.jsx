import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../useAppContext.js';
import { UserPlus, ArrowLeft } from '@phosphor-icons/react';

const CreateAccount = () => {
  const { createAccount, login } = useAppContext();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [stage, setStage] = useState('entry');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingInfo, setPendingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = (digitsOnly) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setSuccess(`A 6-digit verification code has been sent to +${digitsOnly}.`);
    setError('');
    setStage('verify');
    setOtp('');
    setPendingInfo({ name: name.trim() || 'Citizen User', mobile: digitsOnly });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (stage === 'entry') {
        const digitsOnly = mobile.replace(/\D/g, '');
        if (!digitsOnly) { setError('Please enter a valid mobile number.'); return; }
        if (digitsOnly.length < 10) { setError('Mobile number must contain at least 10 digits.'); return; }
        sendOtp(digitsOnly);
        return;
      }

      if (stage === 'verify') {
        if (!otp.trim()) { setError('Enter the OTP sent to your phone.'); return; }
        if (otp.trim() !== generatedOtp) { setError('Incorrect OTP. Please try again.'); return; }
        const account = createAccount({ name: pendingInfo.name, mobile: pendingInfo.mobile });
        login({ userId: account.mobile, role: 'Citizen', name: account.name });
        setSuccess('Verification complete. Redirecting to your portal...');
        setTimeout(() => { navigate('/home'); }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!pendingInfo) return;
    sendOtp(pendingInfo.mobile);
    setSuccess(`A new OTP has been sent to +${pendingInfo.mobile}.`);
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-panel">
          <section className="login-header">
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--accent-blue)'
            }}>
              <UserPlus size={26} weight="fill" />
            </div>
            <h1>Create Citizen Account</h1>
            <p>
              {stage === 'entry'
                ? 'Register with your mobile number for secure verification.'
                : `Enter the 6-digit code sent to +${pendingInfo?.mobile}.`}
            </p>
          </section>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['Register', 'Verify'].map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: (stage === 'entry' ? i === 0 : i <= 1)
                  ? 'var(--accent-blue)'
                  : 'rgba(255,255,255,0.1)'
              }} />
            ))}
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {stage === 'entry' && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name" name="name" type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number *</label>
                  <input
                    id="mobile" name="mobile" type="tel" value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    aria-required="true"
                  />
                </div>
              </>
            )}

            {stage === 'verify' && (
              <>
                <div className="form-group">
                  <label htmlFor="otp">Verification Code</label>
                  <input
                    id="otp" name="otp" type="text" value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter the 6-digit OTP"
                    aria-required="true"
                  />
                </div>
                <div className="otp-display">
                  <span className="otp-label">Demo OTP:</span>
                  <code className="otp-code">{generatedOtp}</code>
                  <button
                    type="button" className="otp-copy"
                    onClick={() => navigator.clipboard.writeText(generatedOtp)}
                    title="Copy OTP"
                  >📋</button>
                </div>
                <button type="button" className="btn-ghost" onClick={handleResendOtp}
                  style={{ marginBottom: '0.75rem', width: '100%' }}>
                  Resend OTP
                </button>
              </>
            )}

            {error   && <p className="form-error"  role="alert">⚠ {error}</p>}
            {success && <p className="form-success" role="status">✓ {success}</p>}

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.25rem' }} disabled={isLoading}>
              {isLoading ? 'Processing...' : (stage === 'entry' ? 'Send OTP' : 'Verify & Create Account')}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} /> Back to login options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
