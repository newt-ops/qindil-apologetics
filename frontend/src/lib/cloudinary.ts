/**
 * Cloudinary Direct Upload Utility
 * Handles image file uploads to Cloudinary with fallback handling.
 */

export async function uploadToCloudinary(
  file: File,
  folder = 'qindil/avatars'
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddhzu434e';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'qindil_preset';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    }

    // Fallback: in offline / dev fallback situations, resolve to local data URL
    console.warn('Cloudinary upload returned non-200. Falling back to data URL.');
    return await readFileAsDataUrl(file);
  } catch (err) {
    console.warn('Cloudinary upload network error. Falling back to data URL:', err);
    return await readFileAsDataUrl(file);
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
