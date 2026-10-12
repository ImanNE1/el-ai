/**
 * Client-side image optimization and processing utilities.
 * Prepares images for Multimodal AI Vision models (Google Gemini / OpenAI Vision)
 * with auto-resizing, compression, and clipboard/drag-and-drop helpers.
 */

export const MAX_IMAGE_COUNT = 4;
export const MAX_RAW_FILE_SIZE_MB = 20;

/**
 * Compress and resize an image file/blob to an optimized base64 Data URL.
 * Caps maximum dimension to 1400px and encodes as JPEG with 0.84 quality,
 * keeping payloads lightweight (~120KB - 280KB) while preserving sharp details for OCR and scene analysis.
 */
export async function optimizeImageFile(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic type validation
    if (!file.type.startsWith("image/")) {
      reject(new Error("File bukan berupa gambar yang didukung."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDimension = 1400;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 0.84 quality (optimal for Vision AI tokens & speed)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.84);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extract image files from clipboard DataTransfer.
 */
export function getImagesFromClipboard(event: React.ClipboardEvent | ClipboardEvent): File[] {
  const files: File[] = [];
  const items = event.clipboardData?.items;
  if (!items) return files;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  return files;
}

/**
 * Extract image files from drag-and-drop event.
 */
export function getImagesFromDrop(event: React.DragEvent | DragEvent): File[] {
  const files: File[] = [];
  const dropFiles = event.dataTransfer?.files;
  if (!dropFiles) return files;

  for (let i = 0; i < dropFiles.length; i++) {
    const file = dropFiles[i];
    if (file.type.startsWith("image/")) {
      files.push(file);
    }
  }

  return files;
}
