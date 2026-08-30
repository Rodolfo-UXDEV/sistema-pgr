/**
 * Utilitários para conversão e manipulação de imagens para PDF e DOCX
 */

/**
 * Converte qualquer imagem ou Data URL (SVG, WebP, JPEG, PNG) para PNG Base64
 */
export async function ensurePngDataUrl(dataUrl: string, targetWidth = 500, targetHeight = 130): Promise<string> {
  if (!dataUrl) return '';

  // Se já for PNG Base64, retorna diretamente
  if (dataUrl.startsWith('data:image/png;base64,')) {
    return dataUrl;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return dataUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.naturalWidth || targetWidth;
          const height = img.naturalHeight || targetHeight;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const pngUrl = canvas.toDataURL('image/png');
            return resolve(pngUrl);
          }
        } catch (e) {
          console.error('Erro ao renderizar imagem no canvas:', e);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

/**
 * Converte um Data URL em Uint8Array para uso no Docx (ImageRun)
 */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array | null {
  try {
    if (!dataUrl || !dataUrl.includes(',')) return null;
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error('Erro ao converter dataUrl para Uint8Array:', e);
    return null;
  }
}
