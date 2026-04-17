import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const from = location.state?.from?.pathname || '/';
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation state
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: '#ef4444' };
    if (password.length < 10) return { strength: 2, label: 'Medium', color: '#f59e0b' };
    return { strength: 3, label: 'Strong', color: '#10b981' };
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const getEmailError = () => {
    if (!touched.email) return '';
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email';
    return '';
  };

  const getPasswordError = () => {
    if (!touched.password) return '';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const getConfirmPasswordError = () => {
    if (!touched.confirmPassword) return '';
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const isFormValid = () => {
    if (isLogin) {
      return validateEmail(email) && password.length >= 6;
    }
    return validateEmail(email) && password.length >= 6 && password === confirmPassword && displayName.trim().length >= 2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!isFormValid()) {
      setTouched({ email: true, password: true, confirmPassword: true });
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        await signUp(email, password, displayName);
        setSuccess('Account created successfully!');
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setTouched({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  const passwordStrength = !isLogin ? getPasswordStrength(password) : null;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link to="/" className="auth-logo">
            <span className="logo-emoji">🚀</span>
            <span className="logo-text">Megan Apps</span>
          </Link>

          {/* Header */}
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to continue to Megan Apps' : 'Join Megan Apps and start publishing'}</p>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="message error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiAlertCircle /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                className="message success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiCheckCircle /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Display Name (Signup only) */}
            {!isLogin && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label><FiUser /> Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={() => handleBlur('displayName')}
                  placeholder="How should we call you?"
                  className={touched.displayName && displayName.length < 2 ? 'error' : ''}
                />
                {touched.displayName && displayName.length < 2 && (
                  <span className="field-error">Name must be at least 2 characters</span>
                )}
              </motion.div>
            )}

            {/* Email */}
            <div className="form-group">
              <label><FiMail /> Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className={getEmailError() ? 'error' : ''}
                autoComplete="email"
              />
              {getEmailError() && <span className="field-error">{getEmailError()}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label><FiLock /> Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  className={getPasswordError() ? 'error' : ''}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {getPasswordError() && <span className="field-error">{getPasswordError()}</span>}
              
              {/* Password strength (Signup only) */}
              {!isLogin && password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-${passwordStrength.strength}`}
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%`, background: passwordStrength.color }}
                    />
                  </div>
                  <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label><FiLock /> Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm your password"
                    className={getConfirmPasswordError() ? 'error' : ''}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {getConfirmPasswordError() && <span className="field-error">{getConfirmPasswordError()}</span>}
              </motion.div>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            )}

            {/* Terms (Signup only) */}
            {!isLogin && (
              <p className="terms-text">
                By creating an account, you agree to our{' '}
                <Link to="/docs/terms" target="_blank">Terms</Link> and{' '}
                <Link to="/docs/privacy" target="_blank">Privacy Policy</Link>.
              </p>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or continue with</span>
          </div>

          {/* Google Sign In */}
          <button 
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FcGoogle size={20} />
            <span>Google</span>
          </button>

          {/* Switch Mode */}
          <p className="switch-mode">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={switchMode} className="switch-btn">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Background */}
      <div className="auth-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
        }

        .auth-card {
          background: rgba(20, 20, 35, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          margin-bottom: 24px;
        }

        .logo-emoji {
          font-size: 28px;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .auth-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 500;
        }

        .form-group input {
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: white;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
        }

        .form-group input:focus {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }

        .form-group input.error {
          border-color: #ef4444;
        }

        .field-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper input {
          width: 100%;
          padding-right: 50px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px;
          font-size: 18px;
        }

        .toggle-password:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .password-strength {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s;
        }

        .password-strength span {
          font-size: 12px;
          font-weight: 500;
        }

        .forgot-password {
          text-align: right;
          color: #6366f1;
          text-decoration: none;
          font-size: 13px;
          margin-top: -8px;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .terms-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
        }

        .terms-text a {
          color: #6366f1;
          text-decoration: none;
        }

        .terms-text a:hover {
          text-decoration: underline;
        }

        .submit-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-btn.loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0 20px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .divider span {
          padding: 0 12px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: white;
          border: none;
          border-radius: 14px;
          color: #333;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .google-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .google-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .switch-mode {
          text-align: center;
          margin-top: 24px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .switch-btn {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
          font-size: 14px;
        }

        .switch-btn:hover {
          text-decoration: underline;
        }

        /* Background */
        .auth-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: #6366f1;
          top: -100px;
          right: -100px;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: #8b5cf6;
          bottom: -50px;
          left: -50px;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: #06b6d4;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* Mobile */
        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 20px;
          }

          .auth-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
