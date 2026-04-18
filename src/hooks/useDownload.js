import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AppLauncher } from '@capacitor/app-launcher';
import { Toast } from '@capacitor/toast';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useDownload = () => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  // Request notification permission on first use
  const requestNotificationPermission = async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  };

  const downloadAndInstall = async (url, fileName, appName, meganId) => {
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
      // Request notification permission
      await requestNotificationPermission();

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
      setDownloadStatus('Processing file...');
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
      setDownloadStatus('Saving to Downloads...');
      const savedFile = await Filesystem.writeFile({
        path: `Download/MeganApps/${fileName}`,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });

      setDownloadProgress(100);
      setDownloadStatus('Download complete!');

      // Step 4: Show Toast
      await Toast.show({
        text: `✅ ${appName} downloaded!`,
        duration: 'long',
        position: 'bottom'
      });

      // Step 5: Show Local Notification (persistent in tray)
      const notificationId = Date.now();
      await LocalNotifications.schedule({
        notifications: [{
          title: "📦 Download Complete",
          body: `${appName} is ready to install!`,
          id: notificationId,
          schedule: { at: new Date(Date.now() + 500) },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: { 
            fileUri: savedFile.uri,
            fileName: fileName,
            appName: appName
          }
        }]
      });

      // Step 6: Add notification click listener for install
      LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
        const fileUri = notification.notification.extra?.fileUri;
        if (fileUri && fileName.endsWith('.apk')) {
          try {
            await AppLauncher.open({ uri: fileUri });
          } catch (error) {
            console.error('Install from notification error:', error);
          }
        }
      });

      // Step 7: Auto-install APK
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
              text: '📦 APK saved. Tap notification to install.',
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
        text: `❌ Download failed`,
        duration: 'long'
      });
      
      // Show error notification
      await LocalNotifications.schedule({
        notifications: [{
          title: "❌ Download Failed",
          body: `${appName} could not be downloaded.`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 500) }
        }]
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
