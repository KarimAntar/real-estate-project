// src/app/components/ProfileImage.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { getUserProfilePicture, getInitials } from "../services/profileService";

interface ProfileImageProps {
  user: any;
  size?: number;
  className?: string;
  alt?: string;
}

export default function ProfileImage({ 
  user, 
  size = 150, 
  className = "", 
  alt = "Profile Picture" 
}: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the profile picture URL
  const profileUrl = getUserProfilePicture(user);
  
  // If image failed to load or is problematic, show fallback
  if (imageError || !profileUrl) {
    const initials = getInitials(user?.fullName || 'User');
    const backgroundColor = '#4F46E5';
    const textColor = '#ffffff';
    
    return (
      <div
        className={`flex items-center justify-center bg-blue-600 text-white font-bold rounded-full ${className}`}
        style={{ 
          width: size, 
          height: size,
          fontSize: size * 0.4,
          backgroundColor,
          color: textColor
        }}
      >
        {initials}
      </div>
    );
  }

  // For external URLs that might cause issues with Next.js Image
  const isExternalUrl = !profileUrl.startsWith('/') && 
                       !profileUrl.startsWith('data:') &&
                       !profileUrl.includes(window?.location?.hostname || '');

  if (isExternalUrl) {
    return (
      <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        {isLoading && (
          <div 
            className="absolute inset-0 bg-gray-600 animate-pulse rounded-full"
            style={{ width: size, height: size }}
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profileUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  // Use Next.js Image for internal URLs
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-600 animate-pulse rounded-full"
          style={{ width: size, height: size }}
        />
      )}
      <Image
        src={profileUrl}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        unoptimized={profileUrl.includes('ui-avatars.com') || profileUrl.includes('googleusercontent.com')}
      />
    </div>
  );
}