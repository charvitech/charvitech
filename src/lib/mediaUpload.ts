async function compressImageToDataUrl(
  file: File,
  maxDimension: number,
  initialQuality: number,
  maxChars: number
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = imageUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
    const width = Math.max(1, Math.round((img.width || maxDimension) * scale));
    const height = Math.max(1, Math.round((img.height || maxDimension) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Image processing unavailable in this browser.');
    }
    ctx.drawImage(img, 0, 0, width, height);

    let quality = initialQuality;
    let output = canvas.toDataURL('image/jpeg', quality);
    while (output.length > maxChars && quality > 0.35) {
      quality = Math.max(0.35, quality - 0.12);
      output = canvas.toDataURL('image/jpeg', quality);
    }

    if (output.length > maxChars) {
      const smallerCanvas = document.createElement('canvas');
      smallerCanvas.width = Math.max(1, Math.round(width * 0.7));
      smallerCanvas.height = Math.max(1, Math.round(height * 0.7));
      const smallCtx = smallerCanvas.getContext('2d');
      if (smallCtx) {
        smallCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
        output = smallerCanvas.toDataURL('image/jpeg', 0.65);
      }
    }

    return output;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function uploadSiteImage(
  file: File,
  getToken: () => Promise<string | null>
): Promise<string> {
  // Compress large camera photos before sending to server so upload stays fast
  const serverReadyDataUrl = await compressImageToDataUrl(file, 1400, 0.84, 3_500_000);

  try {
    const token = await getToken();
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        filename: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
        mimeType: 'image/jpeg',
        base64Data: serverReadyDataUrl,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        return data.url;
      }
    }
  } catch {
    // Fall through to compact client-side Data URL fallback when Express is unavailable (e.g. static hosting)
  }

  // Fallback for static hosting (Netlify): compact JPEG Data URL safe for Firestore document limits
  return compressImageToDataUrl(file, 880, 0.72, 130_000);
}
