import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AppLauncher } from '@capacitor/app-launcher';
import { Toast } from '@capacitor/toast';

export const useDownload = () => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const downloadAndInstall = async (url, fileName, appName) => {
    const isNative = Capacitor.isNativePlatform();
    
    // Web fallback
    if (!isNative) {
      window.open(url, '_blank');
      return { success: true, method: 'web' };
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Starting download...');

    try {
      // Step 1: Download file with progress
      const response = await fetch(url);
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        if (total) {
          const progress = Math.round((received / total) * 100);
          setDownloadProgress(progress);
          setDownloadStatus(`Downloading... ${progress}%`);
        }
      }

      // Step 2: Combine chunks
      const blob = new Blob(chunks);
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      // Step 3: Save to filesystem
      setDownloadStatus('Saving file...');
      const savedFile = await Filesystem.writeFile({
        path: `downloads/${fileName}`,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });

      setDownloadProgress(100);
      setDownloadStatus('Download complete!');

      // Step 4: Show notification
      await Toast.show({
        text: `✅ ${appName} downloaded successfully!`,
        duration: 'long',
        position: 'bottom'
      });

      // Step 5: Auto-install APK
      if (fileName.endsWith('.apk')) {
        setDownloadStatus('Opening installer...');
        setTimeout(async () => {
          try {
            await AppLauncher.open({
              uri: savedFile.uri
            });
            setDownloadStatus('Installer opened');
          } catch (error) {
            console.error('Install error:', error);
            await Toast.show({
              text: '📦 APK saved. Tap to install from Downloads.',
              duration: 'long'
            });
          }
        }, 500);
      }

      setIsDownloading(false);
      
      return {
        success: true,
        method: 'native',
        path: savedFile.uri,
        size: received
      };

    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadStatus('Download failed');
      
      await Toast.show({
        text: `❌ Download failed: ${error.message}`,
        duration: 'long'
      });
      
      // Fallback to browser download
      window.open(url, '_blank');
      
      return { success: false, error: error.message };
    }
  };

  return {
    downloadAndInstall,
    downloadProgress,
    isDownloading,
    downloadStatus
  };
};
