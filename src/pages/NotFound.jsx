import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiUpload, FiCompass } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <motion.div 
          className="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated 404 */}
          <div className="error-code">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >4</motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="zero"
            >0</motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >4</motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </motion.p>

          <motion.div 
            className="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link to="/" className="action-btn primary">
              <FiHome /> Go Home
            </Link>
            <Link to="/search" className="action-btn secondary">
              <FiSearch /> Search Apps
            </Link>
            <Link to="/upload" className="action-btn secondary">
              <FiUpload /> Publish App
            </Link>
          </motion.div>

          {/* Suggested Links */}
          <motion.div 
            className="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p className="suggestions-title">
              <FiCompass /> You might be looking for:
            </p>
            <div className="suggestion-links">
              <Link to="/">Home</Link>
              <span>•</span>
              <Link to="/docs/api">API Docs</Link>
              <span>•</span>
              <Link to="/settings">Settings</Link>
              <span>•</span>
              <Link to="/docs/terms">Terms</Link>
              <span>•</span>
              <Link to="/docs/privacy">Privacy</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Animation */}
      <div className="background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .error-code {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .error-code span {
          font-size: 120px;
          font-weight: 900;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .error-code .zero {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        h1 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 32px;
        }

        .actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 40px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .action-btn.primary:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .suggestions {
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .suggestions-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          margin-bottom: 16px;
        }

        .suggestion-links {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-links a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .suggestion-links a:hover {
          color: #a78bfa;
        }

        .suggestion-links span {
          color: rgba(255, 255, 255, 0.2);
        }

        /* Background Orbs */
        .background {
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
          animation: float1 8s ease-in-out infinite;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: #8b5cf6;
          bottom: -50px;
          left: -50px;
          animation: float2 10s ease-in-out infinite;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: #06b6d4;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float3 12s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.15); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .error-code span {
            font-size: 80px;
          }

          h1 {
            font-size: 24px;
          }

          p {
            font-size: 14px;
          }

          .actions {
            flex-direction: column;
            width: 100%;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
