import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="docs-page">
      <div className="docs-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: April 17, 2026</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, publishing apps, or contacting support.</p>
        </section>
        
        <section>
          <h2>2. How We Use Information</h2>
          <p>We use your information to provide and improve Megan Apps services, communicate with you, and ensure security.</p>
        </section>
        
        <section>
          <h2>3. Cookies</h2>
          <p>We use cookies to maintain your session and preferences.</p>
        </section>
        
        <section>
          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your data.</p>
        </section>
        
        <section>
          <h2>5. Your Rights</h2>
          <p>You can access, update, or delete your account information at any time.</p>
        </section>
        
        <section>
          <h2>6. Contact</h2>
          <p>For privacy concerns, contact us at privacy@megan.qzz.io</p>
        </section>
      </div>
      
      <style jsx>{`
        .docs-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: #0a0a0f;
        }
        .docs-container {
          max-width: 800px;
          margin: 0 auto;
          color: white;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          margin-bottom: 30px;
        }
        h1 {
          font-size: 36px;
          margin-bottom: 10px;
        }
        .last-updated {
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 30px;
        }
        section {
          margin-bottom: 30px;
        }
        h2 {
          font-size: 22px;
          margin-bottom: 15px;
          color: #a78bfa;
        }
        p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
};

export default Privacy;
