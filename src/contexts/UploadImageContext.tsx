import { createContext, useContext, useState, ReactNode } from 'react';

interface UploadImageContextType {
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
}

const UploadImageContext = createContext<UploadImageContextType | undefined>(undefined);

export function UploadImageProvider({ children }: { children: ReactNode }) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  return (
    <UploadImageContext.Provider value={{ uploadedImage, setUploadedImage }}>
      {children}
    </UploadImageContext.Provider>
  );
}

export function useUploadImage() {
  const context = useContext(UploadImageContext);
  if (context === undefined) {
    throw new Error('useUploadImage must be used within a UploadImageProvider');
  }
  return context;
} 