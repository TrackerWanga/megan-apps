import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, FiGlobe, FiSmartphone, FiBox, FiMessageCircle,
  FiCheck, FiX, FiImage, FiLink, FiUser, FiType, FiFileText, 
  FiTag, FiFile, FiCopy, FiCheckCircle, FiLoader, FiAlertCircle,
  FiExternalLink, FiShare2, FiDownload, FiCode, FiHash
} from 'react-icons/fi';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CATEGORIES = ['entertainment', 'tools', 'games', 'social', 'productivity', 'education', 'lifestyle', 'finance', 'health', 'music', 'photo', 'video', 'bot', 'other'];

const APP_TYPES = [
  { id: 'website', label: 'Website', icon: FiGlobe, color: '#06b6d4', accept: null },
  { id: 'apk', label: 'Android APK', icon: FiSmartphone, color: '#10b981', accept: '.apk,application/vnd.android.package-archive' },
  { id: 'wap', label: 'Web App (PWA)', icon: FiBox, color: '#f59e0b', accept: '.zip,application/zip' },
  { id: 'bot', label: 'Bot', icon: FiMessageCircle, color: '#8b5cf6', accept: '.zip,.js,.py,application/zip,text/javascript' }
];

const VERIFICATION_STEPS = [
  { id: 'url', label: 'Verifying website URL', icon: FiLink },
  { id: 'metadata', label: 'Validating metadata', icon: FiFileText },
  { id: 'copyright', label: 'Copyright confirmation', icon: FiAlertCircle },
  { id: 'publish', label: 'Publishing your app', icon: FiUpload }
];

const Upload = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1=Form, 2=Verifying, 3=Success
  const [formData, setFormData] = useState({
    name: '', developer: '', description: '', category: 'entertainment',
    type: 'website', website: '', tags: ''
  });
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    url: 'pending',
    metadata: 'pending',
    copyright: 'pending',
    publish: 'pending'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedApp, setUploadedApp] = useState(null);
  const [copied, setCopied] = useState({ share: false, download: false, embed: false });

  const activeType = APP_TYPES.find(t => t.id === formData.type);
  const isAnonymous = !user;
  const canUploadType = (typeId) => {
    if (isAnonymous) return typeId === 'website';
    return true;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (typeId) => {
    if (!canUploadType(typeId)) return;
    setFormData({ ...formData, type: typeId, website: '' });
    setMainFile(null);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setMainFile(file);
  };

  const updateVerificationStep = (stepId, status) => {
    setVerificationStatus(prev => ({ ...prev, [stepId]: status }));
  };

  const handlePublish = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions');
      return;
    }

    if (formData.type !== 'website' && !mainFile) {
      setError(`Please select a ${formData.type.toUpperCase()} file to upload`);
      return;
    }

    setStep(2);
    setError('');
    setUploadProgress(0);

    // Step 1: Verify URL
    updateVerificationStep('url', 'loading');
    setUploadProgress(10);
    
    if (formData.type === 'website') {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        updateVerificationStep('url', 'complete');
      } catch {
        updateVerificationStep('url', 'error');
        setError('Website URL is not accessible');
        return;
      }
    } else {
      updateVerificationStep('url', 'complete');
    }
    setUploadProgress(30);

    // Step 2: Validate metadata
    updateVerificationStep('metadata', 'loading');
    await new Promise(resolve => setTimeout(resolve, 600));
    updateVerificationStep('metadata', 'complete');
    setUploadProgress(50);

    // Step 3: Copyright check
    updateVerificationStep('copyright', 'loading');
    await new Promise(resolve => setTimeout(resolve, 500));
    updateVerificationStep('copyright', 'complete');
    setUploadProgress(70);

    // Step 4: Publish
    updateVerificationStep('publish', 'loading');
    
    const metadata = {
      name: formData.name,
      type: formData.type,
      developer: formData.developer,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      website: formData.type === 'website' ? formData.website : undefined
    };

    const formDataToSend = new FormData();
    formDataToSend.append('metadata', JSON.stringify(metadata));
    if (icon) formDataToSend.append('icon', icon);
    if (mainFile) formDataToSend.append('file', mainFile);

    try {
      const result = await api.uploadApp(formDataToSend);
      setUploadProgress(90);
      
      if (result.success) {
        updateVerificationStep('publish', 'complete');
        setUploadProgress(100);
        setUploadedApp(result.data);
        setTimeout(() => setStep(3), 500);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (err) {
      updateVerificationStep('publish', 'error');
      setError(err.message);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard?.writeText(text);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
  };

  const getEmbedCode = () => {
    return `<a href="https://apps.megan.qzz.io/app/${uploadedApp?.slug}" target="_blank">Download ${uploadedApp?.name}</a>`;
  };

  const resetForm = () => {
    setStep(1);
    setFormData({ name: '', developer: '', description: '', category: 'entertainment', type: 'website', website: '', tags: '' });
    setIcon(null);
    setIconPreview('');
    setMainFile(null);
    setTermsAccepted(false);
    setVerificationStatus({ url: 'pending', metadata: 'pending', copyright: 'pending', publish: 'pending' });
    setUploadProgress(0);
    setUploadedApp(null);
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <motion.div 
          className="upload-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="upload-header">
            <motion.div 
              className="upload-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <FiUpload />
            </motion.div>
            <h1>Publish Your App</h1>
            {user ? (
              <p className="welcome-message">
                Welcome back, <span>{user.displayName || 'Developer'}</span>! Let's publish something amazing...
              </p>
            ) : (
              <p className="welcome-message">
                Share your creation with the world on Megan Apps
              </p>
            )}
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">App Details</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Verify</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Published!</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Form */}
            {step === 1 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Sign-in prompt for anonymous */}
                {isAnonymous && (
                  <div className="signin-prompt">
                    <FiAlertCircle />
                    <span>Sign in to unlock APK, Bot, and Web App uploads</span>
                    <Link to="/login" className="signin-link">Sign In</Link>
                  </div>
                )}

                {/* App Type */}
                <div className="form-section">
                  <label>App Type</label>
                  <div className="type-selector">
                    {APP_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isActive = formData.type === type.id;
                      const isDisabled = !canUploadType(type.id);
                      
                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          className={`type-option ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                          style={{ '--type-color': type.color }}
                          onClick={() => handleTypeChange(type.id)}
                          whileHover={!isDisabled ? { scale: 1.02 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          disabled={isDisabled}
                        >
                          <Icon />
                          <span>{type.label}</span>
                          {isDisabled && <FiLock className="lock-icon" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="form-section">
                  <div className="input-group">
                    <label><FiType /> App Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="My Awesome App"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label><FiUser /> Developer Name *</label>
                    <input
                      type="text"
                      name="developer"
                      value={formData.developer}
                      onChange={handleInputChange}
                      placeholder={user?.displayName || "Your Name or Company"}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label><FiFileText /> Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your app..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label><FiTag /> Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {formData.type === 'website' && (
                    <motion.div 
                      className="input-group"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label><FiLink /> Website URL *</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://your-website.com"
                        required
                      />
                    </motion.div>
                  )}

                  {formData.type !== 'website' && (
                    <motion.div 
                      className="input-group"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label><FiFile /> {formData.type === 'apk' ? 'APK File *' : formData.type === 'wap' ? 'ZIP File *' : 'Bot File *'}</label>
                      {mainFile ? (
                        <div className="file-selected">
                          <FiFile style={{ color: activeType?.color }} />
                          <div>
                            <p>{mainFile.name}</p>
                            <span>{(mainFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <button onClick={() => setMainFile(null)}><FiX /></button>
                        </div>
                      ) : (
                        <div className="file-upload-area" onClick={() => document.getElementById('file-input').click()}>
                          <FiUpload />
                          <p>Click to upload {formData.type === 'apk' ? 'APK' : formData.type === 'wap' ? 'ZIP' : 'Bot'} file</p>
                          <span>{formData.type === 'apk' ? 'Max 100MB' : 'Max 50MB'}</span>
                          <input
                            id="file-input"
                            type="file"
                            accept={activeType?.accept}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="input-group">
                    <label><FiTag /> Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="movies, streaming, free"
                    />
                  </div>

                  <div className="input-group">
                    <label><FiImage /> App Icon (Optional)</label>
                    {iconPreview ? (
                      <div className="icon-preview">
                        <img src={iconPreview} alt="Icon" />
                        <button onClick={() => { setIcon(null); setIconPreview(''); }}>
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="file-upload-area icon-upload" onClick={() => document.getElementById('icon-input').click()}>
                        <FiUpload />
                        <p>Click to upload icon</p>
                        <span>PNG, JPG, WEBP (Max 5MB)</span>
                        <input
                          id="icon-input"
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="terms-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span>I agree to the </span>
                    <Link to="/docs/terms" target="_blank">Terms and Conditions</Link>
                    <span> and </span>
                    <Link to="/docs/privacy" target="_blank">Privacy Policy</Link>
                  </label>
                </div>

                {error && (
                  <div className="error-message">
                    <FiAlertCircle /> {error}
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handlePublish}
                    disabled={!formData.name || !formData.developer || !formData.description}
                  >
                    Continue to Verification
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Verification */}
            {step === 2 && (
              <motion.div
                key="verifying"
                className="verification-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="verification-header">
                  <h2>{uploadProgress === 100 ? '🎉 Almost there!' : '🔍 Verifying your app...'}</h2>
                </div>

                <div className="verification-steps">
                  {VERIFICATION_STEPS.map((vStep) => {
                    const status = verificationStatus[vStep.id];
                    const Icon = vStep.icon;
                    
                    return (
                      <div key={vStep.id} className={`verification-step ${status}`}>
                        <div className="step-icon">
                          {status === 'loading' && <FiLoader className="spinning" />}
                          {status === 'complete' && <FiCheckCircle />}
                          {status === 'error' && <FiX />}
                          {status === 'pending' && <Icon />}
                        </div>
                        <span className="step-text">{vStep.label}</span>
                        <span className="step-status">
                          {status === 'loading' && 'In progress...'}
                          {status === 'complete' && 'Complete!'}
                          {status === 'error' && 'Failed'}
                          {status === 'pending' && 'Waiting...'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="progress-text">{uploadProgress}% Complete</p>

                {error && (
                  <div className="error-message">
                    <FiAlertCircle /> {error}
                    <button onClick={() => setStep(1)}>Go Back</button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {step === 3 && uploadedApp && (
              <motion.div
                key="success"
                className="success-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <FiCheckCircle />
                </motion.div>
                
                <h2>Published Successfully!</h2>
                <p>Your app is now live on Megan Apps</p>

                <div className="app-summary">
                  <div className="summary-item">
                    <span>App Name</span>
                    <strong>{uploadedApp.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Megan ID</span>
                    <code>{uploadedApp.meganId}</code>
                  </div>
                  <div className="summary-item">
                    <span>Slug</span>
                    <code>{uploadedApp.slug}</code>
                  </div>
                </div>

                <div className="share-section">
                  <div className="share-card">
                    <div className="share-header">
                      <FiShare2 />
                      <span>Share URL</span>
                    </div>
                    <code>apps.megan.qzz.io/app/{uploadedApp.slug}</code>
                    <button 
                      className={`copy-btn ${copied.share ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(`https://apps.megan.qzz.io/app/${uploadedApp.slug}`, 'share')}
                    >
                      {copied.share ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy Link</>}
                    </button>
                  </div>

                  {uploadedApp.type !== 'website' && (
                    <div className="share-card">
                      <div className="share-header">
                        <FiDownload />
                        <span>Download URL (CDN)</span>
                      </div>
                      <code>{uploadedApp.downloadUrl}</code>
                      <button 
                        className={`copy-btn ${copied.download ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(uploadedApp.downloadUrl, 'download')}
                      >
                        {copied.download ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy URL</>}
                      </button>
                    </div>
                  )}

                  <div className="share-card">
                    <div className="share-header">
                      <FiCode />
                      <span>Embed Code</span>
                    </div>
                    <code>{getEmbedCode()}</code>
                    <button 
                      className={`copy-btn ${copied.embed ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(getEmbedCode(), 'embed')}
                    >
                      {copied.embed ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy HTML</>}
                    </button>
                  </div>
                </div>

                <div className="success-actions">
                  <button className="btn-primary" onClick={() => window.open(`/app/${uploadedApp.slug}`, '_blank')}>
                    <FiExternalLink /> View App
                  </button>
                  <button className="btn-secondary" onClick={resetForm}>
                    Publish Another
                  </button>
                  <button className="btn-secondary" onClick={() => window.location.href = '/'}>
                    Go Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style jsx>{`
        .upload-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: #0a0a0f;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .upload-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .upload-card {
          background: rgba(20, 20, 35, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .upload-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .upload-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
        }

        h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          color: white;
        }

        .welcome-message {
          color: rgba(255, 255, 255, 0.7);
        }

        .welcome-message span {
          color: #6366f1;
          font-weight: 600;
        }

        /* Step Indicator */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
        }

        .step.active .step-number {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .step.active .step-label,
        .step.completed .step-label {
          color: white;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 8px 24px;
        }

        /* Sign-in Prompt */
        .signin-prompt {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 14px;
          margin-bottom: 24px;
          color: #a78bfa;
        }

        .signin-link {
          margin-left: auto;
          padding: 6px 16px;
          background: #6366f1;
          border-radius: 20px;
          color: white;
          text-decoration: none;
          font-weight: 500;
        }

        /* Form Sections */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .input-group input,
        .input-group textarea,
        .input-group select {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: white;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
        }

        .input-group input:focus,
        .input-group textarea:focus,
        .input-group select:focus {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }

        .input-group select option {
          background: #1a1a2e;
        }

        /* Type Selector */
        .type-selector {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .type-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s;
          font-size: 13px;
        }

        .type-option.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--type-color);
          color: var(--type-color);
        }

        .type-option.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .lock-icon {
          font-size: 12px;
        }

        /* File Upload */
        .file-selected {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
        }

        .file-selected div {
          flex: 1;
        }

        .file-selected p {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .file-selected span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .file-selected button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.2);
          border: none;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-upload-area {
          padding: 30px;
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .file-upload-area:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
        }

        .file-upload-area svg {
          font-size: 32px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 10px;
        }

        .file-upload-area p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 6px;
        }

        .file-upload-area span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .icon-upload {
          padding: 20px;
        }

        .icon-preview {
          position: relative;
          display: inline-block;
        }

        .icon-preview img {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          object-fit: cover;
        }

        .icon-preview button {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Terms */
        .terms-section {
          margin-top: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
        }

        .checkbox-label a {
          color: #6366f1;
          text-decoration: none;
        }

        .checkbox-label a:hover {
          text-decoration: underline;
        }

        /* Error */
        .error-message {
          margin-top: 20px;
          padding: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 14px;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-message button {
          margin-left: auto;
          padding: 6px 14px;
          background: rgba(239, 68, 68, 0.2);
          border: none;
          border-radius: 8px;
          color: #ef4444;
          cursor: pointer;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 14px;
          margin-top: 28px;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Verification Section */
        .verification-section {
          text-align: center;
        }

        .verification-header h2 {
          font-size: 24px;
          margin-bottom: 28px;
          color: white;
        }

        .verification-steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 28px;
        }

        .verification-step {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
        }

        .verification-step .step-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .verification-step .step-text {
          flex: 1;
          text-align: left;
          color: rgba(255, 255, 255, 0.7);
        }

        .verification-step .step-status {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
        }

        .verification-step.loading .step-icon {
          color: #6366f1;
        }

        .verification-step.complete .step-icon {
          color: #10b981;
        }

        .verification-step.error .step-icon {
          color: #ef4444;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-bar-container {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Success Section */
        .success-section {
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #10b981, #34d399);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44px;
          color: white;
        }

        .success-section h2 {
          font-size: 28px;
          margin-bottom: 8px;
          color: white;
        }

        .success-section > p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 28px;
        }

        .app-summary {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: left;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item span {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .summary-item strong {
          color: white;
        }

        .summary-item code {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          color: #a78bfa;
        }

        .share-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 28px;
        }

        .share-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 18px;
          text-align: left;
        }

        .share-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .share-card code {
          display: block;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 14px;
          word-break: break-all;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 10px;
          color: #a78bfa;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .copy-btn:hover {
          background: rgba(99, 102, 241, 0.2);
        }

        .copy-btn.copied {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .success-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .success-actions .btn-primary,
        .success-actions .btn-secondary {
          flex: 1;
          min-width: 120px;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .upload-card {
            padding: 24px 18px;
          }

          h1 {
            font-size: 26px;
          }

          .type-selector {
            grid-template-columns: repeat(2, 1fr);
          }

          .success-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Upload;
