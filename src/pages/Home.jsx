import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiStar, FiLock, FiGlobe, FiSmartphone, FiBox, FiMessageCircle, FiEye, FiHeart } from 'react-icons/fi';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../components/SplashScreen';

const Home = () => {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All', icon: '🎯' },
    { id: 'apk', label: 'APK', icon: '📱' },
    { id: 'website', label: 'Web', icon: '🌐' },
    { id: 'wap', label: 'PWA', icon: '📲' },
    { id: 'bot', label: 'Bot', icon: '🤖' }
  ];

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, selectedCategory]);

  const loadApps = async () => {
    try {
      const result = await api.getApps();
      if (result.success) {
        setApps(result.data.apps || []);
        setFilteredApps(result.data.apps || []);
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    if (selectedCategory === 'all') {
      setFilteredApps(apps);
    } else {
      setFilteredApps(apps.filter(app => app.type === selectedCategory));
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'website': return <FiGlobe style={{ color: '#06b6d4' }} />;
      case 'apk': return <FiSmartphone style={{ color: '#10b981' }} />;
      case 'wap': return <FiBox style={{ color: '#f59e0b' }} />;
      case 'bot': return <FiMessageCircle style={{ color: '#8b5cf6' }} />;
      default: return <FiGlobe style={{ color: '#06b6d4' }} />;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'website': return 'Visit';
      case 'apk': return 'Install';
      case 'wap': return 'Install';
      case 'bot': return 'Add Bot';
      default: return 'Open';
    }
  };

  const handleDownload = (e, app) => {
    e.stopPropagation();
    
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

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-content"
        >
          <h1 className="hero-title">
            Discover Amazing
            <span className="gradient-text"> Apps</span>
          </h1>
          <p className="hero-subtitle">
            Find the best apps, games, and tools for your device
          </p>
        </motion.div>
      </section>

      {/* Category Pills */}
      <div className="category-section">
        <div className="category-scroll">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="results-info">
          <span className="results-count">
            {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'} available
          </span>
        </div>
      )}

      {/* App Grid */}
      <div className="app-grid-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading amazing apps...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="empty-icon">📭</div>
            <h3>No apps yet</h3>
            <p>Be the first to publish an app on Megan Apps!</p>
            <Link to="/upload" className="publish-cta">
              🚀 Publish Your App
            </Link>
          </motion.div>
        ) : (
          <div className="app-grid">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id || app.meganId}
                className="app-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/app/${app.slug}`)}
              >
                {/* App Icon */}
                <div className="app-icon">
                  {app.media?.icon ? (
                    <img src={app.media.icon} alt={app.name} />
                  ) : (
                    <div className="app-icon-placeholder">
                      {getTypeIcon(app.type)}
                    </div>
                  )}
                </div>

                {/* App Info */}
                <div className="app-info">
                  <div className="app-header">
                    <h3 className="app-name">{app.name}</h3>
                    <span className="app-type-badge">
                      {getTypeIcon(app.type)}
                    </span>
                  </div>
                  
                  <p className="app-developer">{app.developer}</p>
                  
                  <p className="app-description">
                    {app.metadata?.description || app.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="app-stats">
                    <div className="stat">
                      <FiStar className={`star-icon ${app.stats?.rating > 0 ? 'rated' : ''}`} />
                      <span>{app.stats?.rating?.toFixed(1) || '0.0'}</span>
                      {app.stats?.ratingCount > 0 && (
                        <span className="stat-count">({app.stats.ratingCount})</span>
                      )}
                    </div>
                    <div className="stat">
                      <FiEye />
                      <span>{app.stats?.views || 0}</span>
                    </div>
                    <div className="stat">
                      <FiDownload />
                      <span>{app.stats?.downloads || 0}</span>
                    </div>
                    <div className="stat">
                      <FiHeart />
                      <span>{app.stats?.likes || 0}</span>
                    </div>
                    {app.storage?.fileSize && (
                      <div className="stat file-size">
                        {(app.storage.fileSize / 1024 / 1024).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                </div>

                {/* Install Button */}
                <button
                  className={`install-btn ${!user ? 'locked' : ''}`}
                  onClick={(e) => handleDownload(e, app)}
                >
                  {user ? (
                    <><FiDownload /> {getTypeLabel(app.type)}</>
                  ) : (
                    <><FiLock /> Sign in</>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          padding-bottom: 40px;
        }

        .hero-section {
          padding: 40px 20px 20px;
          text-align: center;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 12px;
          color: white;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(14px, 3vw, 18px);
          color: rgba(255, 255, 255, 0.6);
        }

        .category-section {
          padding: 16px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .category-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }

        .category-scroll::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 30px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s;
        }

        .category-pill.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .results-info {
          padding: 16px 20px 8px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .results-count {
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
        }

        .app-grid-container {
          padding: 8px 20px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .app-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .app-card {
          background: rgba(20, 20, 35, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }

        .app-card:hover {
          background: rgba(30, 30, 45, 0.8);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .app-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .app-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .app-icon-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .app-info {
          flex: 1;
          margin-bottom: 16px;
        }

        .app-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .app-name {
          font-size: 18px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
        }

        .app-developer {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 10px;
        }

        .app-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .app-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .star-icon {
          color: rgba(255, 255, 255, 0.3);
        }

        .star-icon.rated {
          color: #fbbf24;
        }

        .stat-count {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
        }

        .file-size {
          margin-left: auto;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
        }

        .install-btn {
          width: 100%;
          padding: 12px 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .install-btn.locked {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: none;
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: white;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 24px;
        }

        .publish-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 30px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        @media (max-width: 480px) {
          .app-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
