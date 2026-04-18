import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiDownload, FiFolder, FiFile, 
  FiSmartphone, FiTrash2, FiPlay, FiExternalLink,
  FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AppLauncher } from '@capacitor/app-launcher';
import { Toast } from '@capacitor/toast';

const Downloads = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    await scanMeganAppsFolder();
    setLoading(false);
  };

  const scanMeganAppsFolder = async () => {
    const isNative = Capacitor.isNativePlatform();
    
    if (!isNative) {
      // Web fallback - show mock or localStorage
      setFiles([]);
      return;
    }

    try {
      // List files in MeganApps folder
      const result = await Filesystem.readdir({
        path: 'MeganApps',
        directory: Directory.External
      });

      const fileList = [];
      let totalSize = 0;

      for (const item of result.files) {
        if (item.type === 'file') {
          try {
            const stat = await Filesystem.stat({
              path: `MeganApps/${item.name}`,
              directory: Directory.External
            });
            
            fileList.push({
              name: item.name,
              size: stat.size,
              modified: stat.mtime,
              uri: stat.uri,
              type: getFileType(item.name)
            });
            
            totalSize += stat.size;
          } catch (e) {
            console.error('Failed to stat file:', item.name);
          }
        }
      }

      // Sort by modified date (newest first)
      fileList.sort((a, b) => (b.modified || 0) - (a.modified || 0));
      setFiles(fileList);
      
      // Get storage info
      setStorageInfo({
        used: totalSize,
        total: 0 // Android doesn't easily expose this
      });

    } catch (error) {
      console.error('Failed to scan folder:', error);
      // Folder might not exist yet
      setFiles([]);
    }
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'apk') return 'apk';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    if (['mp4', 'mkv', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav'].includes(ext)) return 'audio';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'apk': return <FiSmartphone className="text-green-400" />;
      case 'archive': return <FiFile className="text-yellow-400" />;
      case 'video': return <FiPlay className="text-blue-400" />;
      default: return <FiFile className="text-gray-400" />;
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const openFile = async (file) => {
    if (file.type === 'apk') {
      try {
        await AppLauncher.open({ uri: file.uri });
      } catch (error) {
        await Toast.show({ text: 'Cannot open file', duration: 'short' });
      }
    } else {
      await Toast.show({ 
        text: `File saved at: ${file.uri}`, 
        duration: 'long' 
      });
    }
  };

  const deleteFile = async (file) => {
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) return;

    try {
      await Filesystem.deleteFile({
        path: `MeganApps/${file.name}`,
        directory: Directory.External
      });
      
      await Toast.show({ 
        text: `✅ Deleted ${file.name}`, 
        duration: 'short' 
      });
      
      // Refresh list
      await scanMeganAppsFolder();
    } catch (error) {
      await Toast.show({ 
        text: `❌ Failed to delete`, 
        duration: 'short' 
      });
    }
  };

  const openFolder = async () => {
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) return;

    try {
      // Try to open the folder using file URI
      const result = await Filesystem.readdir({
        path: 'MeganApps',
        directory: Directory.External
      });
      
      await Toast.show({ 
        text: `📁 MeganApps folder contains ${files.length} files`, 
        duration: 'long' 
      });
    } catch (error) {
      await Toast.show({ 
        text: 'Open File Manager to view MeganApps folder', 
        duration: 'long' 
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await scanMeganAppsFolder();
    setRefreshing(false);
  };

  const totalSizeFormatted = formatSize(storageInfo.used);

  return (
    <div className="downloads-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <Link to="/" className="back-link">
            <FiArrowLeft /> Back
          </Link>
          <div className="header-actions">
            <button 
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        {/* Title Section */}
        <motion.div 
          className="title-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>
            <FiDownload className="title-icon" />
            My Downloads
          </h1>
          <p className="subtitle">
            {files.length} files · {totalSizeFormatted}
          </p>
        </motion.div>

        {/* Storage Info */}
        <motion.div 
          className="storage-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="storage-info">
            <FiFolder className="folder-icon" />
            <div className="storage-details">
              <span className="storage-label">MeganApps Folder</span>
              <span className="storage-path">/storage/emulated/0/MeganApps</span>
            </div>
            <button className="open-folder-btn" onClick={openFolder}>
              <FiExternalLink /> Open
            </button>
          </div>
        </motion.div>

        {/* Files List */}
        <div className="files-section">
          <h2>Downloaded Files</h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading downloads...</p>
            </div>
          ) : files.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FiFolder className="empty-icon" />
              <h3>No downloads yet</h3>
              <p>Apps you download will appear here</p>
              <Link to="/" className="browse-btn">
                Browse Apps
              </Link>
            </motion.div>
          ) : (
            <div className="files-list">
              {files.map((file, index) => (
                <motion.div
                  key={file.name}
                  className="file-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="file-info" onClick={() => openFile(file)}>
                    <div className="file-icon">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-meta">
                        {formatSize(file.size)} · {formatDate(file.modified)}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteFile(file)}
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .downloads-page {
          min-height: 100vh;
          background: #0a0a0f;
          padding: 20px 16px 40px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 15px;
        }

        .back-link:hover {
          color: white;
        }

        .refresh-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .refresh-btn.spinning svg {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .title-section {
          margin-bottom: 24px;
        }

        h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .title-icon {
          color: #6366f1;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .storage-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 28px;
        }

        .storage-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .folder-icon {
          font-size: 24px;
          color: #fbbf24;
        }

        .storage-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .storage-label {
          color: white;
          font-weight: 500;
        }

        .storage-path {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          font-family: monospace;
        }

        .open-folder-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          color: #a78bfa;
          font-size: 13px;
          cursor: pointer;
        }

        .files-section h2 {
          font-size: 18px;
          color: white;
          margin-bottom: 16px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .loading-state p {
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: white;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 24px;
        }

        .browse-btn {
          display: inline-block;
          padding: 12px 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 30px;
          color: white;
          text-decoration: none;
          font-weight: 600;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 12px 16px;
        }

        .file-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
        }

        .file-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .file-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .file-name {
          color: white;
          font-weight: 500;
          word-break: break-all;
        }

        .file-meta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .delete-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 26px;
          }
          
          .storage-path {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Downloads;
