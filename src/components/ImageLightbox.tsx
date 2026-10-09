"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

export default function ImageLightbox({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }} 
        className={`relative group cursor-pointer ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-md" />
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }}
        >
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
          />
        </div>
      )}
    </>
  );
}
