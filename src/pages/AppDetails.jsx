import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDownload, FiStar, FiCalendar, FiTag, FiUser, FiGlobe, 
  FiSmartphone, FiBox, FiMessageCircle, FiArrowLeft, 
  FiShare2, FiLock, FiCheck, FiX, FiChevronLeft, FiChevronRight,
  FiHeart, FiEye, FiUsers, FiExternalLink
} from 'react-icons/fi';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AppDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '', userName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    loadApp();
  }, [slug]);

  const loadApp = async () => {
    try {
      const result = await api.getApp(slug);
      if (result.success) {
        setApp(result.data.app);
        setLikeCount(result.data.app.stats?.likes || 0);
        loadReviews(result.data.app.meganId);
        
        if (user) {
          checkLikeStatus(result.data.app.meganId);
        }
      }
    } catch (error) {
      console.error('Failed to load app:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (meganId) => {
    try {
      const result = await api.getReviews(meganId);
      if (result.success) {
        setReviews(result.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const checkLikeStatus = async (meganId) => {
    try {
      const result = await api.checkLiked(meganId);
      if (result.success) {
        setLiked(result.data.liked);
      }
    } catch (error) {
      console.error('Failed to check like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLikeLoading(true);
    try {
      const result = await api.likeApp(app.meganId);
      if (result.success) {
        setLiked(result.data.liked);
        setLikeCount(result.data.likes);
      }
    } catch (error) {
      console.error('Failed to like app:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFollowLoading(true);
    try {
      const result = following 
        ? await api.unfollowDeveloper(app.developerId)
        : await api.followDeveloper(app.developerId);
      
      if (result.success) {
        setFollowing(!following);
      }
    } catch (error) {
      console.error('Failed to follow developer:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDownload = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (app.type === 'website') {
      window.open(app.storage?.websiteUrl || app.website, '_blank');
    } else {
      const downloadUrl = app.storage?.kvUrl || app.downloadUrl;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    }
  };

  const handleShare = () => {
    const shareUrl = `https://apps.megan.qzz.io/app/${app.slug}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await api.addReview(app.meganId, {
        userId: user.uid,
        userName: review.userName || user.displayName || 'Anonymous',
        rating: review.rating,
        comment: review.comment
      });
      if (result.success) {
        setShowReviewForm(false);
        setReview({ rating: 5, comment: '', userName: '' });
        loadApp(); // Reload to update rating and reviews
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'website': return <FiGlobe style={{ color: '#06b6d4' }} />;
      case 'apk': return <FiSmartphone style={{ color: '#10b981' }} />;
      case 'wap': return <FiBox style={{ color: '#f59e0b' }} />;
      case 'bot': return <FiMessageCircle style={{ color: '#8b5cf6' }} />;
      default: return <FiGlobe />;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'website': return 'Visit Website';
      case 'apk': return 'Install';
      case 'wap': return 'Install PWA';
      case 'bot': return 'Add Bot';
      default: return 'Open';
    }
  };

  const getDeveloperInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'D';
  };

  const screenshots = app?.media?.screenshots || [];
  const hasScreenshots = screenshots.length > 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="error-container">
        <h2>App not found</h2>
        <button onClick={() => navigate('/')} className="back-home-btn">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="app-details-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="details-container"
      >
        {/* Header Card */}
        <div className="header-card">
          <div className="header-content">
            <div className="app-icon-large">
              {app.media?.icon ? (
                <img src={app.media.icon} alt={app.name} />
              ) : (
                <div className="icon-placeholder">
                  {getTypeIcon(app.type)}
                </div>
              )}
            </div>
            
            <div className="app-info-section">
              <div className="app-title-section">
                {getTypeIcon(app.type)}
                <h1>{app.name}</h1>
              </div>
              
              {/* Developer Info with Follow */}
              <div className="developer-section">
                <div className="developer-info">
                  <div className="developer-avatar">
                    {getDeveloperInitial(app.developer)}
                  </div>
                  <span className="developer-name">{app.developer || 'Unknown'}</span>
                </div>
                {user && app.developerId && app.developerId !== 'anonymous' && (
                  <button 
                    className={`follow-btn ${following ? 'following' : ''}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <div className="spinner-small" />
                    ) : following ? (
                      <><FiCheck /> Following</>
                    ) : (
                      <><FiUsers /> Follow</>
                    )}
                  </button>
                )}
              </div>
              
              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-item">
                  <FiStar className="star-icon" />
                  <span className="stat-value">{app.stats?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="stat-label">({app.stats?.ratingCount || 0})</span>
                </div>
                <div className="stat-item">
                  <FiDownload />
                  <span className="stat-value">{app.stats?.downloads || 0}</span>
                  <span className="stat-label">downloads</span>
                </div>
                <div className="stat-item">
                  <FiEye />
                  <span className="stat-value">{app.stats?.views || 0}</span>
                  <span className="stat-label">views</span>
                </div>
                <button 
                  className={`like-btn ${liked ? 'liked' : ''}`}
                  onClick={handleLike}
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <div className="spinner-small" />
                  ) : (
                    <>
                      <FiHeart className={liked ? 'filled' : ''} />
                      <span>{likeCount}</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="install-btn" onClick={handleDownload}>
                  {user ? (
                    <><FiDownload /> {getTypeLabel(app.type)}</>
                  ) : (
                    <><FiLock /> Sign in to {getTypeLabel(app.type)}</>
                  )}
                </button>
                <button className="share-btn" onClick={handleShare}>
                  <FiShare2 /> {copied ? 'Copied!' : 'Share'}
                </button>
                {app.website && (
                  <button className="website-btn" onClick={() => window.open(app.website, '_blank')}>
                    <FiExternalLink /> Website
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots - Only show if available */}
        {hasScreenshots && (
          <div className="screenshots-section">
            <h3>Screenshots</h3>
            <div className="screenshots-container">
              <button 
                className="screenshot-nav prev"
                onClick={() => setCurrentScreenshot(Math.max(0, currentScreenshot - 1))}
                disabled={currentScreenshot === 0}
              >
                <FiChevronLeft />
              </button>
              
              <div className="screenshots-scroll">
                {screenshots.map((ss, index) => (
                  <motion.img
                    key={index}
                    src={ss}
                    alt={`Screenshot ${index + 1}`}
                    className={`screenshot ${currentScreenshot === index ? 'active' : ''}`}
                    onClick={() => setCurrentScreenshot(index)}
                    whileHover={{ scale: 1.02 }}
                  />
                ))}
              </div>
              
              <button 
                className="screenshot-nav next"
                onClick={() => setCurrentScreenshot(Math.min(screenshots.length - 1, currentScreenshot + 1))}
                disabled={currentScreenshot === screenshots.length - 1}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* About & Info Grid */}
        <div className="info-grid">
          <div className="about-card">
            <h3>About this app</h3>
            <p className="description">{app.metadata?.description || app.description}</p>
            
            {app.metadata?.tags && app.metadata.tags.length > 0 && (
              <div className="tags-section">
                <div className="tags-header">
                  <FiTag /> <span>Tags</span>
                </div>
                <div className="tags-list">
                  {app.metadata.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="info-card">
            <h3>Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{app.metadata?.category || app.category}</span>
              </div>
              
              {app.storage?.fileSize && (
                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">{(app.storage.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">Updated</span>
                <span className="info-value">
                  <FiCalendar style={{ marginRight: 4 }} />
                  {new Date(app.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Version</span>
                <span className="info-value">{app.storage?.version || '1.0.0'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Platform</span>
                <span className="info-value">Android {app.type === 'apk' ? '• APK' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h3>Reviews & Ratings</h3>
            {user && !showReviewForm && (
              <button className="write-review-btn" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                className="review-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitReview}
              >
                <div className="form-group">
                  <label>Rating</label>
                  <div className="star-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= review.rating ? 'active' : ''}`}
                        onClick={() => setReview({ ...review, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={review.userName}
                    onChange={(e) => setReview({ ...review, userName: e.target.value })}
                    placeholder={user?.displayName || 'Your name'}
                    className="glass-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    placeholder="Share your experience..."
                    className="glass-input"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((r, i) => (
                <div key={r.id || i} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{r.userName}</span>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={i < r.rating ? 'filled' : 'empty'} />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <span className="review-date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .app-details-page {
          min-height: 100vh;
          padding: 20px 16px 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .back-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          padding: 8px 0;
        }

        .back-btn:hover { color: white; }

        .back-home-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 30px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
        }

        .header-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .app-icon-large {
          width: 100px;
          height: 100px;
          border-radius: 20px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .app-icon-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .icon-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }

        .app-info-section {
          flex: 1;
          min-width: 250px;
        }

        .app-title-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .app-title-section h1 {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 700;
        }

        .developer-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .developer-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .developer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #06b6d4, #10b981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .developer-name {
          color: rgba(255, 255, 255, 0.8);
        }

        .follow-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .follow-btn.following {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          color: #10b981;
        }

        .follow-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stats-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .star-icon { color: #fbbf24; }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
        }

        .like-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .like-btn.liked {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ef4444;
        }

        .like-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .like-btn .filled { fill: #ef4444; }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .install-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
        }

        .share-btn, .website-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: white;
          font-weight: 500;
          cursor: pointer;
        }

        .screenshots-section {
          margin-bottom: 24px;
        }

        .screenshots-section h3 {
          margin-bottom: 16px;
          font-size: 20px;
        }

        .screenshots-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .screenshot-nav {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .screenshot-nav:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .screenshots-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 0;
          flex: 1;
        }

        .screenshot {
          width: 160px;
          height: 280px;
          object-fit: cover;
          border-radius: 16px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .screenshot.active {
          border-color: #6366f1;
          transform: scale(1.02);
        }

        .info-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .about-card, .info-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
        }

        .about-card h3, .info-card h3 {
          margin-bottom: 16px;
          font-size: 18px;
        }

        .description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .tags-section {
          margin-top: 20px;
        }

        .tags-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          font-size: 13px;
        }

        .info-list {
          display: grid;
          gap: 14px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
        }

        .info-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .info-value {
          font-weight: 500;
        }

        .reviews-section {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
        }

        .reviews-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .write-review-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 30px;
          color: white;
          font-weight: 500;
          cursor: pointer;
        }

        .review-form {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.8);
        }

        .star-selector {
          display: flex;
          gap: 8px;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.2);
        }

        .star-btn.active { color: #fbbf24; }

        .glass-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          outline: none;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .submit-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          cursor: pointer;
        }

        .no-reviews {
          text-align: center;
          padding: 40px;
          color: rgba(255, 255, 255, 0.5);
        }

        .review-card {
          padding: 20px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .review-card:last-child { border-bottom: none; }

        .review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .reviewer-name { font-weight: 600; }

        .review-rating {
          display: flex;
          gap: 2px;
        }

        .review-rating .filled { color: #fbbf24; }
        .review-rating .empty { color: rgba(255, 255, 255, 0.2); }

        .review-comment {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }

        .review-date {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .info-grid { grid-template-columns: 1fr; }
          
          .header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .app-title-section { justify-content: center; }
          .developer-section { justify-content: center; }
          .stats-row { justify-content: center; }
          .action-buttons { justify-content: center; }
          
          .screenshot {
            width: 140px;
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export default AppDetails;
