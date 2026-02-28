import { useState } from 'react';
import JSZip from 'jszip';

// Image type from the API response
export interface ImageData {
  filename: string;
  contentType: string;
  data: string; // base64 encoded
}

export function useImageDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [downloadStats, setDownloadStats] = useState({ successful: 0, total: 0 });

  // Prepare ZIP from base64 images (already downloaded from API)
  const prepareImagesZip = async (
    images: ImageData[],
    setError?: (error: string) => void
  ) => {
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: images.length });
    setZipBlob(null);
    setDownloadStats({ successful: 0, total: images.length });

    try {
      if (images.length === 0) {
        console.log('No images found in this page.');
        setIsDownloading(false);
        return null;
      }

      console.log(`Preparing ZIP with ${images.length} images`);
      
      const zip = new JSZip();
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setDownloadProgress({ current: i + 1, total: images.length });
        
        try {
          // Convert base64 to binary
          const binaryString = atob(image.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
          
          zip.file(image.filename, bytes, { binary: true });
        } catch (err) {
          console.error(`Error processing image ${image.filename}:`, err);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      
      if (blob.size === 0) {
        console.warn('No images could be added to ZIP.');
        setDownloadStats({ successful: 0, total: images.length });
        if (setError) {
          setError('No s\'han pogut preparar les imatges.');
        }
        return null;
      }

      console.log('ZIP prepared successfully');
      setZipBlob(blob);
      setDownloadStats({ successful: images.length, total: images.length });
      return blob;

    } catch (error) {
      console.error('Error preparing images ZIP:', error);
      if (setError) {
        setError(`Error preparant les imatges: ${error instanceof Error ? error.message : 'Error desconegut'}`);
      }
      return null;
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const downloadZip = (pageId: string) => {
    if (!zipBlob) {
      alert('No hi ha imatges preparades per descarregar.');
      return;
    }

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `images-${pageId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setZipBlob(null);
    setDownloadStats({ successful: 0, total: 0 });
  };

  return {
    prepareImagesZip,
    downloadZip,
    reset,
    isDownloading,
    downloadProgress,
    hasImages: zipBlob !== null,
    downloadStats,
  };
}