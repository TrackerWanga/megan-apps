import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUser, FiMail, FiGlobe, FiMapPin, FiFileText, FiBriefcase, FiKey, FiLogOut, FiSave, FiEdit2, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Settings = () => {
  const { user, profile, logOut, isDeveloper } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  
  // Developer state
  const [company, setCompany] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [devWebsite, setDevWebsite] = useState('');
  
  // Edit modes
  const [editProfile, setEditProfile] = useState(false);
  const [editDeveloper, setEditDeveloper] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  useEffect(() => {
    if (isDeveloper && profile?.developerProfile) {
      setCompany(profile.developerProfile.company || '');
      setWhatsapp(profile.developerProfile.whatsapp || '');
      setTelegram(profile.developerProfile.telegram || '');
      setDevWebsite(profile.developerProfile.website || '');
    }
  }, [isDeveloper, profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await api.updateMe({
        displayName,
        username,
        bio,
        location,
        website
      });
      if (result.success) {
        setMessage('✅ Profile updated successfully!');
        setEditProfile(false);
      } else {
        setMessage('❌ Failed to update profile');
      }
    } catch (error) {
      setMessage('❌ Error updating profile');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveDeveloper = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await api.updateMe({
        developerProfile: {
          company,
          whatsapp,
          telegram,
          website: devWebsite
        }
      });
      if (result.success) {
        setMessage('✅ Developer profile updated!');
        setEditDeveloper(false);
      } else {
        setMessage('❌ Failed to update developer profile');
      }
    } catch (error) {
      setMessage('❌ Error updating developer profile');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="settings-page">
        <div className="container">
          <Link to="/" className="back-link"><FiArrowLeft /> Back to Home</Link>
          <div className="signin-prompt">
            <h2>Sign in required</h2>
            <p>Please sign in to view your settings.</p>
            <Link to="/login" className="signin-btn">Sign In</Link>
          </div>
        </div>
        <style jsx>{`
          .settings-page { min-height: 100vh; background: #0a0a0f; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .back-link { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); text-decoration: none; margin-bottom: 20px; }
          .signin-prompt { text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.03); border-radius: 20px; }
          .signin-prompt h2 { color: white; margin-bottom: 12px; }
          .signin-prompt p { color: rgba(255,255,255,0.6); margin-bottom: 24px; }
          .signin-btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 30px; color: white; text-decoration: none; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>

        <div className="page-header">
          <h1>⚙️ Settings</h1>
        </div>

        {message && <div className="message-banner">{message}</div>}

        {/* Profile Section */}
        <div className="section">
          <div className="section-header">
            <h2><FiUser /> Profile</h2>
            {!editProfile && (
              <button className="edit-btn" onClick={() => setEditProfile(true)}>
                <FiEdit2 /> Edit
              </button>
            )}
          </div>
          
          <div className="section-content">
            <div className="field">
              <span className="field-label">Display Name</span>
              {editProfile ? (
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
              ) : (
                <span className="field-value">{displayName || 'Not set'}</span>
              )}
            </div>
            <div className="field">
              <span className="field-label">Username</span>
              {editProfile ? (
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
              ) : (
                <span className="field-value">{username ? `@${username}` : 'Not set'}</span>
              )}
            </div>
            <div className="field">
              <span className="field-label"><FiFileText /> Bio</span>
              {editProfile ? (
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" rows={2} />
              ) : (
                <span className="field-value">{bio || 'Not set'}</span>
              )}
            </div>
            <div className="field">
              <span className="field-label"><FiMapPin /> Location</span>
              {editProfile ? (
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              ) : (
                <span className="field-value">{location || 'Not set'}</span>
              )}
            </div>
            <div className="field">
              <span className="field-label"><FiGlobe /> Website</span>
              {editProfile ? (
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
              ) : (
                <span className="field-value">{website || 'Not set'}</span>
              )}
            </div>
            
            {editProfile && (
              <div className="action-buttons">
                <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="cancel-btn" onClick={() => { setEditProfile(false); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="section">
          <div className="section-header">
            <h2><FiMail /> Account</h2>
          </div>
          <div className="section-content">
            <div className="field">
              <span className="field-label">Email</span>
              <span className="field-value">{user.email}</span>
            </div>
            <button className="link-btn" onClick={() => navigate('/change-password')}>
              Change Password
            </button>
          </div>
        </div>

        {/* Developer Section (only if developer) */}
        {isDeveloper && (
          <div className="section">
            <div className="section-header">
              <h2><FiBriefcase /> Developer</h2>
              {!editDeveloper && (
                <button className="edit-btn" onClick={() => setEditDeveloper(true)}>
                  <FiEdit2 /> Edit
                </button>
              )}
            </div>
            <div className="section-content">
              <div className="field">
                <span className="field-label">Company</span>
                {editDeveloper ? (
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
                ) : (
                  <span className="field-value">{company || 'Not set'}</span>
                )}
              </div>
              <div className="field">
                <span className="field-label"><FaWhatsapp style={{ color: '#25D366' }} /> WhatsApp</span>
                {editDeveloper ? (
                  <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+254..." />
                ) : (
                  <span className="field-value">{whatsapp || 'Not set'}</span>
                )}
              </div>
              <div className="field">
                <span className="field-label"><FaTelegram style={{ color: '#26A5E4' }} /> Telegram</span>
                {editDeveloper ? (
                  <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
                ) : (
                  <span className="field-value">{telegram || 'Not set'}</span>
                )}
              </div>
              <div className="field">
                <span className="field-label"><FiGlobe /> Developer Website</span>
                {editDeveloper ? (
                  <input type="url" value={devWebsite} onChange={(e) => setDevWebsite(e.target.value)} placeholder="https://" />
                ) : (
                  <span className="field-value">{devWebsite || 'Not set'}</span>
                )}
              </div>
              
              {editDeveloper && (
                <div className="action-buttons">
                  <button className="save-btn" onClick={handleSaveDeveloper} disabled={saving}>
                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="cancel-btn" onClick={() => { setEditDeveloper(false); }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Keys Quick Access */}
        <div className="section">
          <div className="section-header">
            <h2><FiKey /> API Keys</h2>
          </div>
          <div className="section-content">
            <p className="section-desc">Manage your API keys for programmatic access.</p>
            <Link to="/docs/api" className="link-btn">
              <FiKey /> Manage API Keys →
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <div className="section">
          <div className="section-content">
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page { min-height: 100vh; background: #0a0a0f; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .back-link { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); text-decoration: none; margin-bottom: 20px; }
        .back-link:hover { color: white; }
        
        .page-header { margin-bottom: 24px; }
        h1 { font-size: 32px; font-weight: 700; color: white; }
        
        .message-banner { padding: 12px 16px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; color: #10b981; margin-bottom: 20px; text-align: center; }
        
        .section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        h2 { font-size: 18px; font-weight: 600; color: white; display: flex; align-items: center; gap: 8px; }
        .edit-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; }
        .edit-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        
        .section-content { display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field-label { font-size: 12px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 4px; }
        .field-value { font-size: 15px; color: white; padding: 8px 0; }
        input, textarea { padding: 12px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 14px; outline: none; }
        input:focus, textarea:focus { border-color: #6366f1; background: rgba(99,102,241,0.1); }
        
        .action-buttons { display: flex; gap: 10px; margin-top: 8px; }
        .save-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; color: white; font-weight: 500; cursor: pointer; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cancel-btn { padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; }
        
        .link-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; color: #a78bfa; text-decoration: none; font-weight: 500; cursor: pointer; }
        .link-btn:hover { background: rgba(99,102,241,0.2); }
        .section-desc { color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 8px; }
        
        .logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; color: #ef4444; font-weight: 500; cursor: pointer; }
        .logout-btn:hover { background: rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default Settings;
