import React from 'react';

export default function HacarLogo({ className = 'h-12 w-auto' }) {
  return (
    <img
      src="/hacar-academy-logo.jpg"
      alt="Hacar Academy"
      className={`block object-contain ${className}`}
      draggable="false"
    />
  );
}
