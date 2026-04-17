import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="docs-page">
      <div className="docs-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last Updated: April 17, 2026</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Megan Apps, you agree to be bound by these Terms and Conditions.</p>
        </section>
        
        <section>
          <h2>2. Developer Terms</h2>
          <p>When publishing apps, you confirm that you have the rights to distribute the content and it does not violate any laws.</p>
        </section>
        
        <section>
          <h2>3. Content Guidelines</h2>
          <p>Apps must not contain malicious code, illegal content, or infringe on intellectual property rights.</p>
        </section>
        
        <section>
          <h2>4. Prohibited Content</h2>
          <p>Malware, spyware, adult content, hate speech, and illegal activities are strictly prohibited.</p>
        </section>
        
        <section>
          <h2>5. Intellectual Property</h2>
          <p>You retain ownership of your content. By publishing, you grant Megan Apps a license to display and distribute your app.</p>
        </section>
        
        <section>
          <h2>6. Termination</h2>
          <p>We reserve the right to remove any content that violates these terms.</p>
        </section>
        
        <section>
          <h2>7. Contact</h2>
          <p>For questions, contact us at support@megan.qzz.io</p>
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

export default Terms;
