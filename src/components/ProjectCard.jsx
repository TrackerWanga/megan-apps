import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaDownload, FaEye, FaAndroid, FaGlobe, FaRobot } from 'react-icons/fa';
import { incrementDownloads } from '../services/firebase';

const ProjectCard = ({ project }) => {
  const [installing, setInstalling] = useState(false);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'apk': return <FaAndroid className="text-green-400" />;
      case 'website': return <FaGlobe className="text-blue-400" />;
      case 'bot': return <FaRobot className="text-purple-400" />;
      default: return <FaGlobe className="text-gray-400" />;
    }
  };

  const handleInstall = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (project.type === 'website') {
      window.open(project.websiteUrl, '_blank');
      return;
    }
    
    setInstalling(true);
    
    try {
      window.open(project.fileUrl, '_blank');
      await incrementDownloads(project.id);
      setTimeout(() => setInstalling(false), 2000);
    } catch (error) {
      console.error('Install failed:', error);
      setInstalling(false);
    }
  };

  const getButtonText = () => {
    if (installing) return 'Installing...';
    switch(project.type) {
      case 'apk': return 'Install';
      case 'website': return 'Visit';
      case 'bot': return 'Add Bot';
      case 'wap': return 'Install';
      default: return 'Open';
    }
  };

  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="bg-card rounded-xl p-4 shadow-lg hover:scale-105 transition-transform cursor-pointer">
        <div className="flex items-start space-x-4">
          <img 
            src={project.iconUrl || 'https://via.placeholder.com/80'} 
            alt={project.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getTypeIcon(project.type)}
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
            </div>
            <p className="text-gray-400 text-sm truncate">{project.developerName}</p>
          </div>
        </div>

        <p className="text-gray-300 text-sm mt-3 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-sm">{project.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaDownload className="text-gray-400 text-sm" />
              <span className="text-sm">{project.downloads || 0}</span>
            </div>
          </div>

          <button
            onClick={handleInstall}
            disabled={installing}
            className="bg-primary hover:bg-secondary text-white font-bold py-1 px-3 rounded-lg transition-all text-sm"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
