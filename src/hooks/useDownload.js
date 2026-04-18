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
      // Track download for web too
      if (meganId) {
        fetch(`https://appapi.megan.qzz.io/api/download/${meganId}`).catch(() => {});
      }
      return { success: true, method: 'web' };
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Starting download...');

    try {
      // Track download FIRST (before file operations)
      if (meganId) {
        console.log('📊 Tracking download for:', meganId);
        try {
          const trackResponse = await fetch(`https://appapi.megan.qzz.io/api/download/${meganId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          console.log('✅ Download tracked:', trackResponse.status);
        } catch (e) {
          console.warn('⚠️ Download tracking failed:', e);
        }
      }

      // Create MeganApps folder at root of external storage
      const folderPath = 'MeganApps';
      try {
        await Filesystem.mkdir({
          path: folderPath,
          directory: Directory.External,
          recursive: true
        });
        console.log('✅ MeganApps folder ready at /storage/emulated/0/MeganApps');
      } catch (e) {
        console.log('📁 MeganApps folder already exists');
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

      setDownloadStatus('Saving to MeganApps folder...');
      const blob = new Blob(chunks);
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });

      // Save directly to MeganApps folder
      const savedFile = await Filesystem.writeFile({
        path: `${folderPath}/${fileName}`,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });

      setDownloadProgress(100);
      setDownloadStatus('Complete!');

      // Show success with file location and OPEN FOLDER option
      await Toast.show({
        text: `✅ Saved to MeganApps/${fileName}`,
        duration: 'long',
        position: 'bottom'
      });

      // Auto-install APK or open folder for other files
      if (fileName.endsWith('.apk')) {
        setTimeout(async () => {
          try {
            await AppLauncher.open({ uri: savedFile.uri });
          } catch (error) {
            // If auto-install fails, offer to open folder
            await Toast.show({ 
              text: '📁 Tap to open MeganApps folder', 
              duration: 'long' 
            });
          }
        }, 500);
      } else {
        // For non-APK files, offer to open the folder
        setTimeout(async () => {
          await Toast.show({ 
            text: '📂 File saved. Use file manager to open.', 
            duration: 'long' 
          });
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
