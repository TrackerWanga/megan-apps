import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiPhone, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="copyright">
            © {currentYear} Megan Apps
          </div>
          
          <div className="footer-links">
            <Link to="/docs/terms">Terms</Link>
            <span className="dot">•</span>
            <Link to="/docs/privacy">Privacy</Link>
            <span className="dot">•</span>
            <Link to="/docs/faq">FAQ</Link>
          </div>

          <div className="social-links">
            <a href="https://github.com/TrackerWanga" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="https://wa.me/254758476795" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href="https://youtube.com/@wanga-tech" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FiYoutube />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Made by Tracker Wanga</span>
          <span className="dot">•</span>
          <a href="tel:+254758476795">+254 758 476 795</a>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          margin-top: auto;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 20px;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .copyright {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: #a78bfa;
        }

        .dot {
          color: rgba(255, 255, 255, 0.2);
          font-size: 12px;
        }

        .social-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .social-links a {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s;
        }

        .social-links a:hover {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
          transform: translateY(-2px);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
        }

        .footer-bottom a {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
        }

        .footer-bottom a:hover {
          color: #a78bfa;
        }

        @media (max-width: 640px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-bottom {
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
