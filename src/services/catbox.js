import axios from 'axios';

const CATBOX_UPLOAD_URL = 'https://catbox.moe/user/api.php';

export const uploadToCatbox = async (file, onProgress, retries = 3) => {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', file);
      
      const response = await axios.post(CATBOX_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted, attempt + 1);
          }
        },
      });
      
      if (response.data && response.data.startsWith('https://')) {
        return {
          success: true,
          url: response.data,
          attempts: attempt + 1
        };
      }
      
      throw new Error('Upload failed - Invalid response');
      
    } catch (error) {
      attempt++;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt >= retries) {
        return {
          success: false,
          error: error.message,
          attempts: attempt
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const isValidImageUrl = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
