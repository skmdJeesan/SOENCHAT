import { FileText, Image, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const FilePreview = ({ selectedFile, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const isPDF = selectedFile?.type === 'application/pdf' || selectedFile?.name?.endsWith('.pdf');
  const isImage = selectedFile?.type?.startsWith('image/');

  useEffect(() => {
    if (selectedFile && isImage) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url); // cleanup
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile, isImage]);

  if (!selectedFile) return null;

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-4 p-3 mb-2 rounded-lg bg-white/5 border border-white/10 text-sm w-fit">
      
      {/* Preview/Icon */}
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt={selectedFile.name}
          className="w-10 h-10 object-cover rounded shrink-0"
        />
      ) : isPDF ? (
        <FileText className="w-8 h-8 text-red-400 shrink-0" />
      ) : (
        <FileText className="w-8 h-8 text-gray-400 shrink-0" />
      )}

      {/* File info */}
      <div className="flex items-start flex-col min-w-0">
        <p className="truncate text-white font-medium">{selectedFile.name}</p>
        <p className="text-xs text-gray-400">{formatSize(selectedFile.size)}</p>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
        aria-label="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FilePreview;