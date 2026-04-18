import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiUpload, FiMenu, FiX, FiSettings, FiFileText, FiHelpCircle, FiCode, FiLogOut, FiUser, FiHome, FiGrid, FiStar, FiBookOpen, FiDownload } from 'react-icons/fi';

const Navbar = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
    setMenuOpen(false);
  };

  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <span className="rocket-emoji">🚀</span>
            </div>
            <span className="logo-text">Megan Apps</span>
          </Link>

          <div className="navbar-actions">
            <button className={`icon-btn ${searchOpen ? 'active' : ''}`} onClick={() => setSearchOpen(!searchOpen)}>
              <FiSearch />
            </button>

            <Link to="/upload" className="icon-btn upload-btn">
              <FiUpload />
            </Link>

            {user ? (
              <button className="profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <div className="profile-initial">{getInitial()}</div>
                )}
              </button>
            ) : (
              <Link to="/login" className="signin-btn">
                <FiUser /> Sign In
              </Link>
            )}

            <button className={`icon-btn menu-btn ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-overlay">
            <form onSubmit={handleSearch}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search apps, games, tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              <button type="button" className="close-search" onClick={() => setSearchOpen(false)}>
                <FiX />
              </button>
            </form>
          </div>
        )}
      </nav>

      <div className={`slide-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h3><span className="menu-emoji">🎮</span> Menu</h3>
          <button onClick={() => setMenuOpen(false)}><FiX /></button>
        </div>

        <div className="menu-content">
          {user ? (
            <div className="menu-profile">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} />
              ) : (
                <div className="menu-initial">{getInitial()}</div>
              )}
              <div>
                <p>{user.displayName || 'User'}</p>
                <span>{user.email}</span>
              </div>
            </div>
          ) : (
            <Link to="/login" className="menu-signin" onClick={() => setMenuOpen(false)}>
              <FiUser /> Sign In to Megan Apps
            </Link>
          )}

          <div className="menu-divider"></div>

          <div className="menu-links">
            <Link to="/" onClick={() => setMenuOpen(false)} className="menu-item home">
              <FiHome /> Home
            </Link>
            <Link to="/downloads" onClick={() => setMenuOpen(false)} className="menu-item downloads">
              <FiDownload /> My Downloads
            </Link>
            <Link to="/upload" onClick={() => setMenuOpen(false)} className="menu-item upload">
              <FiUpload /> Publish App
            </Link>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-links">
            <Link to="/settings" onClick={() => setMenuOpen(false)} className="menu-item">
              <FiSettings /> Settings
            </Link>
            <Link to="/docs/api" onClick={() => setMenuOpen(false)} className="menu-item">
              <FiCode /> API Docs
            </Link>
            <Link to="/docs/terms" onClick={() => setMenuOpen(false)} className="menu-item">
              <FiFileText /> Terms
            </Link>
            <Link to="/docs/faq" onClick={() => setMenuOpen(false)} className="menu-item">
              <FiHelpCircle /> FAQ
            </Link>
          </div>

          {user && (
            <>
              <div className="menu-divider"></div>
              <button className="menu-logout" onClick={handleLogout}>
                <FiLogOut /> Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {(searchOpen || menuOpen) && (
        <div className="nav-overlay" onClick={() => { setSearchOpen(false); setMenuOpen(false); }} />
      )}

      <style jsx>{`
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #0f0f1e; border-bottom: 1px solid rgba(99, 102, 241, 0.3); height: 65px; }
        .navbar-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 100%; display: flex; align-items: center; justify-content: space-between; }
        .navbar-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .rocket-emoji { font-size: 26px; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .logo-text { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .navbar-actions { display: flex; align-items: center; gap: 8px; }
        .icon-btn { width: 42px; height: 42px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .icon-btn.active { background: #6366f1; border-color: #6366f1; }
        .upload-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; }
        .profile-btn { width: 42px; height: 42px; border-radius: 12px; background: none; border: none; cursor: pointer; overflow: hidden; }
        .profile-btn img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; border: 2px solid #6366f1; }
        .profile-initial { width: 100%; height: 100%; border-radius: 12px; background: linear-gradient(135deg, #06b6d4, #10b981); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: white; }
        .signin-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 30px; color: white; text-decoration: none; font-size: 14px; }
        .search-overlay { position: fixed; top: 65px; left: 0; right: 0; padding: 15px 20px; background: #0f0f1e; border-bottom: 1px solid rgba(99, 102, 241, 0.3); z-index: 999; }
        .search-overlay form { max-width: 600px; margin: 0 auto; position: relative; }
        .search-overlay .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #6366f1; font-size: 20px; }
        .search-overlay input { width: 100%; padding: 16px 50px 16px 50px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; color: white; font-size: 16px; outline: none; }
        .close-search { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; }
        .slide-menu { position: fixed; top: 0; right: 0; bottom: 0; width: 320px; background: #0f0f1e; border-left: 1px solid rgba(99, 102, 241, 0.3); transform: translateX(100%); transition: transform 0.3s ease; z-index: 1002; }
        .slide-menu.open { transform: translateX(0); }
        .menu-header { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(99, 102, 241, 0.2); }
        .menu-header h3 { font-size: 18px; color: white; display: flex; align-items: center; gap: 8px; }
        .menu-header button { width: 36px; height: 36px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; }
        .menu-content { padding: 20px; }
        .menu-profile { display: flex; align-items: center; gap: 14px; padding: 12px; background: rgba(99, 102, 241, 0.1); border-radius: 16px; }
        .menu-profile img { width: 48px; height: 48px; border-radius: 14px; }
        .menu-initial { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #06b6d4, #10b981); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; color: white; }
        .menu-profile p { color: white; font-weight: 600; }
        .menu-profile span { font-size: 13px; color: rgba(255, 255, 255, 0.5); }
        .menu-signin { display: flex; align-items: center; gap: 10px; padding: 14px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 14px; color: white; text-decoration: none; }
        .menu-divider { height: 1px; background: rgba(99, 102, 241, 0.2); margin: 20px 0; }
        .menu-links { display: flex; flex-direction: column; gap: 6px; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; color: white; text-decoration: none; background: rgba(255, 255, 255, 0.02); }
        .menu-item:hover { background: rgba(99, 102, 241, 0.15); }
        .menu-item.downloads { color: #10b981; }
        .menu-item.upload { color: #8b5cf6; }
        .menu-logout { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; }
        .nav-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); z-index: 1001; }
        @media (max-width: 480px) { .logo-text { font-size: 18px; } .slide-menu { width: 100%; } }
      `}</style>
    </>
  );
};

export default Navbar;
