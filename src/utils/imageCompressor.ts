/**
 * Utility to compress and resize images (e.g. school logo) using HTML5 Canvas.
 * Ensures image payloads stay well below Firestore's 1MB document limit (<40KB).
 * CRITICAL: Preserves PNG and WebP transparency (alpha channel) so transparent logos NEVER get a black background!
 */
export async function compressImage(
  dataUrlOrFile: string | File,
  maxDimension = 280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    let isPngOrTransparent = false;

    if (typeof dataUrlOrFile !== 'string') {
      const type = dataUrlOrFile.type?.toLowerCase() || '';
      const name = dataUrlOrFile.name?.toLowerCase() || '';
      if (
        type.includes('png') ||
        type.includes('webp') ||
        type.includes('svg') ||
        name.endsWith('.png') ||
        name.endsWith('.webp') ||
        name.endsWith('.svg')
      ) {
        isPngOrTransparent = true;
      }
    }

    const handleDataUrl = (src: string) => {
      // If not an image data URL, return as is
      if (!src || !src.startsWith('data:image')) {
        resolve(src);
        return;
      }

      if (
        src.startsWith('data:image/png') ||
        src.startsWith('data:image/webp') ||
        src.startsWith('data:image/svg')
      ) {
        isPngOrTransparent = true;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(src);
          return;
        }

        // Clear canvas completely to keep transparent pixels intact
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Check if canvas has any transparent pixels
        let hasAlpha = isPngOrTransparent;
        if (!hasAlpha) {
          try {
            const sampleW = Math.min(width, 40);
            const sampleH = Math.min(height, 40);
            const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
            for (let i = 3; i < imgData.length; i += 4) {
              if (imgData[i] < 250) {
                hasAlpha = true;
                break;
              }
            }
          } catch {
            // Ignore cross-origin canvas security check if any
          }
        }

        // If image has transparency or is PNG/WebP:
        // NEVER convert to JPEG because JPEG drops the alpha channel and turns transparent background BLACK.
        // Export as PNG (lossless transparent) or WebP with alpha preservation.
        if (hasAlpha) {
          try {
            const webpData = canvas.toDataURL('image/webp', quality);
            // Verify browser supports webp with alpha and size is small (< 45KB)
            if (webpData && webpData.startsWith('data:image/webp') && webpData.length < 45000) {
              resolve(webpData);
              return;
            }
          } catch {
            // Fallback to PNG
          }

          const pngData = canvas.toDataURL('image/png');
          resolve(pngData);
          return;
        }

        // For ordinary opaque photos (JPEG):
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    if (typeof dataUrlOrFile === 'string') {
      handleDataUrl(dataUrlOrFile);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleDataUrl(result);
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
}
