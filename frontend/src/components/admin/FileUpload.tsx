import React, { useState, useRef, useEffect } from 'react';
import Icon from '../icons/Icon';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { getMediaUploadSignatureApi } from '../../api/media';
import { toast } from '../../hooks/useToast';

export interface FileUploadProps {
  value?: string;
  onUploadComplete: (url: string) => void;
  folder?: string;
  label?: string;
  error?: string;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value = '',
  onUploadComplete,
  folder = 'qindil/uploads',
  label,
  error,
  accept = 'image/*',
  className = '',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previewUrl whenever value prop updates (crucial for async data loading)
  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Show temporary local preview while uploading
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      // 1. Fetch signed parameters from backend
      const signRes = await getMediaUploadSignatureApi(folder);

      if (signRes?.data) {
        const { signature, timestamp, apiKey, cloudName } = signRes.data;

        // 2. Build FormData for direct upload to Cloudinary API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const res = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const secureUrl = data.secure_url;
          setPreviewUrl(secureUrl);
          onUploadComplete(secureUrl);
          toast.success('Cover image uploaded successfully!');
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('Cloudinary upload error:', errData);
          toast.error(errData?.error?.message || 'Failed to upload image to cloud storage.');
          setPreviewUrl(value || '');
        }
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error('Network error while uploading image. Please try again.');
      setPreviewUrl(value || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted">
          {label}
        </label>
      )}

      {previewUrl ? (
        <div className="relative group rounded-xl border border-border bg-surface p-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src={previewUrl}
              alt="Uploaded file preview"
              className="h-16 w-16 rounded-lg object-cover border border-gold/30 bg-bg shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-text truncate">Uploaded Media</p>
              <p className="text-[10px] text-textMuted font-mono truncate">{previewUrl}</p>
            </div>
          </div>

          {!disabled && (
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Replace
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          )}
        </div>
      ) : disabled ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-surface/50 p-6 text-center text-xs text-textMuted">
          <span>No media uploaded</span>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 cursor-pointer ${
            dragActive
              ? 'border-gold bg-gold/10'
              : 'border-border bg-surface hover:border-gold/50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2 py-3 text-gold">
              <Spinner size="md" />
              <span className="text-xs font-semibold">Uploading media...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Icon name="Plus" size={20} />
              </div>
              <div className="text-xs text-text">
                <span className="font-bold text-gold hover:underline">Click to upload</span> or drag and drop
              </div>
              <p className="text-[10px] text-textMuted">PNG, JPG, WEBP, GIF up to 10MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
};

export default FileUpload;
