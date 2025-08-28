import React, { useState, useEffect } from 'react';

const AuthenticatedImage = ({ src, alt, className, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setError(true);
        return;
      }

      try {
        // Get token for authentication  
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // For authenticated images from uploads directory, fetch with auth
        if (token && (src.includes('/uploads/') || src.includes('/api/uploads/'))) {
          // Normalize the URL - remove /api if present, backend serves at /uploads
          const normalizedSrc = src.replace('/api/uploads/', '/uploads/').startsWith('/uploads/') 
            ? `http://localhost:3000${src.replace('/api/uploads/', '/uploads/')}` 
            : `http://localhost:3000${src}`;
          const response = await fetch(normalizedSrc, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            // For 404, just show placeholder instead of throwing error
            if (response.status === 404) {
              console.warn('Image not found:', src);
              setError(true);
              return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setImageSrc(blobUrl);
        } else {
          // For non-authenticated images, use direct URL
          setImageSrc(src);
        }
      } catch (err) {
        console.error('Error loading authenticated image:', err);
        setError(true);
      }
    };

    loadImage();

    // Cleanup function to revoke blob URL
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} {...props}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} {...props}>
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default AuthenticatedImage;