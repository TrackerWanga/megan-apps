import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AppLauncher } from '@capacitor/app-launcher';
import { Toast } from '@capacitor/toast';

export const useDownload = () => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const downloadAndInstall = async (url, fileName, appName, meganId) => {
    const isNative = Capacitor.isNativePlatform();
    
    if (!isNative) {
      window.open(url, '_blank');
      return { success: true, method: 'web' };
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Starting download...');

    try {
      // Ensure MeganApps folder exists
      try {
        await Filesystem.mkdir({
          path: 'Download/MeganApps',
          directory: Directory.External,
          recursive: true
        });
      } catch (e) {
        // Folder already exists, ignore
      }

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

      setDownloadStatus('Saving to Downloads/MeganApps...');
      const blob = new Blob(chunks);
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const savedFile = await Filesystem.writeFile({
        path: `Download/MeganApps/${fileName}`,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });

      setDownloadProgress(100);
      setDownloadStatus('Complete!');

      // Show success with file location
      await Toast.show({
        text: `✅ Saved to Downloads/MeganApps/${fileName}`,
        duration: 'long',
        position: 'bottom'
      });

      // Track download (optional - call API)
      if (meganId) {
        try {
          await fetch(`https://appapi.megan.qzz.io/api/download/${meganId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          console.log('Download tracking skipped');
        }
      }

      // Auto-install APK
      if (fileName.endsWith('.apk')) {
        setTimeout(async () => {
          try {
            await AppLauncher.open({ uri: savedFile.uri });
          } catch (error) {
            await Toast.show({ 
              text: '📦 APK saved. Open Downloads/MeganApps to install', 
              duration: 'long' 
            });
          }
        }, 500);
      }

      setIsDownloading(false);
      return { success: true, path: savedFile.uri };

    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      await Toast.show({ text: `❌ Download failed`, duration: 'long' });
      window.open(url, '_blank');
      return { success: false };
    }
  };

  return { downloadAndInstall, downloadProgress, isDownloading, downloadStatus };
};
