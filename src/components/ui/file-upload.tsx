
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFilesUpload: (files: File[]) => void;
  title?: string;
  description?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onFilesUpload, 
    title = "อัพโหลดไฟล์",
    description = "ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์",
    maxFiles,
    maxSize
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesUpload(acceptedFiles);
  }, [onFilesUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSize ? maxSize * 1024 * 1024 : undefined,
    accept: undefined, // Accept all file types
    multiple: true, // Allow multiple files
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <UploadCloud className="w-10 h-10" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm">{description}</p>
        {isDragActive ? (
          <p className="text-sm text-primary">วางไฟล์ที่นี่...</p>
        ) : (
          <p className="text-xs mt-1">
            {maxFiles && `สูงสุด ${maxFiles} ไฟล์. `}
            {maxSize && `ขนาดไม่เกิน ${maxSize}MB.`}
          </p>
        )}
      </div>
    </div>
  );
};
