'use client';
import { useState } from 'react';
import { Download } from "lucide-react";
import ProgressBar from '@/components/ProgressBar';
import ImageProgressBar from '@/components/ImageProgressBar';
import TexCode from '@/components/TypstCode';
import { useImageDownload, type ImageData } from '@/lib/hooks/download-images';

// Typst preamble template
const Preliminar = `// Preamble - Customize as needed
#set page(paper: "a4", margin: 2cm)
#set text(font: "Linux Libertine", size: 11pt, lang: "ca")
#set heading(numbering: "1.1")
#set par(justify: true)
`;

// Helper to check for special characters that need font support
function hasSpecialChars(text: string): boolean {
  // Check for characters outside basic Latin
  return /[^\x00-\xFF]/.test(text);
}

// Helper to check for small command usage
function hasSmallCommand(text: string): boolean {
  return text.includes('#small(') || text.includes('#text(size:');
}

// Concatenate preamble with generated Typst code
function concatTex(preamble: string, code: string, hasWeird: boolean, hasSmall: boolean): string {
  let result = preamble;
  
  if (hasWeird) {
    result += '\n// Note: Document contains special characters - ensure font supports them\n';
  }
  
  if (hasSmall) {
    result += `
// Small text helper function
#let small(body) = text(size: 0.9em, body)
`;
  }
  
  result += '\n// Document content\n' + code;
  return result;
}

export default function Home() {
  const [pageId, setPageId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [texOutput, setTeXOutput] = useState<string | null>(null);
  const [hasWeirdChars, setHasWeirdChars] = useState<boolean>(false);
  const [hasSmall, setHasSmallCommand] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; loading: boolean }>({ current: 0, total: 0, loading: false });
  const [images, setImages] = useState<ImageData[]>([]);

  const { prepareImagesZip, downloadZip, reset, isDownloading, downloadProgress, hasImages, downloadStats } = useImageDownload();

  const generateTeX = async () => {
    if (!pageId.trim()) {
      setError('Si us plau, introdueix un ID de pàgina de Notion.');
      return;
    }

    setError(null);
    setTeXOutput(null);
    setImages([]);
    reset();
    setProgress({ current: 0, total: 1, loading: true });

    try {
      const response = await fetch('/api/getTypstAndImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId: pageId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error convertint la pàgina de Notion');
      }

      setTeXOutput(data.typstCode);
      setImages(data.images || []);
      setHasWeirdChars(hasSpecialChars(data.typstCode));
      setHasSmallCommand(hasSmallCommand(data.typstCode));

      // Prepare images for download if there are any
      if (data.images && data.images.length > 0) {
        await prepareImagesZip(data.images, setError);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setProgress({ current: 0, total: 0, loading: false });
    }
  };

  const handleDownloadImages = () => {
    downloadZip(pageId);
  };


  return (
    <div className="max-w-xl mx-auto p-8 font-sans text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Notion a Typst</h1>
      <p className="text-gray-600 mb-4">
        Introdueix l&apos;ID de la pàgina de Notion per generar el codi Typst corresponent.
      </p>
      <div className="flex items-center gap-4 mt-2">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-md text-base"
          type="text"
          placeholder="30511a9761ab802c808cdbb05b786986"
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
        />
        <button 
          className="bg-green-600 text-white cursor-pointer py-3 px-5 rounded-lg font-medium shadow hover:bg-green-500 transition whitespace-nowrap disabled:bg-gray-400" 
          onClick={generateTeX}
          disabled={progress.loading || isDownloading}
        >
          Generar codi Typst
        </button>
      </div>
      
      <div className="mt-2">
      {error && (
        <>
          <p className="mt-10 font-bold text-gray-800">Error</p>
          <pre className="text-red-600 mt-2 whitespace-pre-wrap">{error}</pre>
        </>
      )}

      {progress.loading && (
        <ProgressBar current={progress.current} total={progress.total} loading={progress.loading} />
      )}

      {isDownloading && (
        <ImageProgressBar current={downloadProgress.current} total={downloadProgress.total} loading={isDownloading} />
      )}

      {texOutput && (
        <>
          <TexCode code={concatTex(Preliminar, texOutput, hasWeirdChars, hasSmall)} />
        </>
      )}

      {/* Add download images button */}
      {texOutput && images.length > 0 && (
        <div className="mt-4">
          <button 
            className="flex items-center gap-2 bg-blue-600 text-white cursor-pointer py-2 px-4 rounded-lg font-medium shadow hover:bg-blue-500 transition disabled:bg-gray-400"
            onClick={handleDownloadImages}
            disabled={isDownloading || progress.loading || !hasImages}
          >
            <Download size={18} /> Descarregar imatges (ZIP)
          </button>
          {downloadStats.total > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {downloadStats.successful > 0 
                ? `${downloadStats.successful} de ${downloadStats.total} imatges preparades` 
                : `S'han detectat ${downloadStats.total} imatges`}
            </p>
          )}
        </div>
      )}

      </div>
    </div>
  );
}