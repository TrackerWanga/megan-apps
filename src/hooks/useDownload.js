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
      if (meganId) {
        fetch(`https://appapi.megan.qzz.io/api/download/${meganId}`).catch(() => {});
      }
      return { success: true, method: 'web' };
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Starting download...');

    try {
      // Track download FIRST
      if (meganId) {
        console.log('📊 Tracking download for:', meganId);
        try {
          await fetch(`https://appapi.megan.qzz.io/api/download/${meganId}`);
          console.log('✅ Download tracked');
        } catch (e) {
          console.warn('⚠️ Download tracking failed:', e);
        }
      }

      // IMPORTANT: Use Directory.External for public storage!
      // This saves to /storage/emulated/0/MeganApps/ (visible to user)
      const folderPath = 'MeganApps';
      
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

      // Save to PUBLIC external storage
      const savedFile = await Filesystem.writeFile({
        path: `${folderPath}/${fileName}`,
        data: base64Data,
        directory: Directory.External,  // This is key - External = public storage
        recursive: true
      });

      console.log('✅ File saved to:', savedFile.uri);

      setDownloadProgress(100);
      setDownloadStatus('Complete!');

      await Toast.show({
        text: `✅ Saved to /storage/emulated/0/MeganApps/`,
        duration: 'long',
        position: 'bottom'
      });

      // Auto-install APK
      if (fileName.endsWith('.apk')) {
        setTimeout(async () => {
          try {
            await AppLauncher.open({ uri: savedFile.uri });
          } catch (error) {
            console.error('Install error:', error);
            await Toast.show({ 
              text: '📁 Find APK in MeganApps folder', 
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
      
      // Check if it's a permissions issue
      if (error.message?.includes('permission')) {
        await Toast.show({ 
          text: '❌ Storage permission needed', 
          duration: 'long' 
        });
      } else {
        await Toast.show({ text: `❌ Download failed`, duration: 'long' });
      }
      
      // Fallback to browser
      window.open(url, '_blank');
      return { success: false };
    }
  };

  return { downloadAndInstall, downloadProgress, isDownloading, downloadStatus };
};
