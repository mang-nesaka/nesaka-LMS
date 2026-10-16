"use client";

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  content: string;
  className?: string;
}

// Deteksi karakter Arab
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

export default function RichContent({ content, className = '' }: Props) {
  if (!content) return null;

  // Cek apakah seluruh teks dominan Arab
  const isArabic = containsArabic(content);

  // Parse rumus KaTeX ($...$ inline atau $$...$$ display)
  const renderMathAndText = () => {
    // Split berdasarkan $$...$$ (display math) atau $...$ (inline math)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        try {
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return (
            <span
              key={index}
              className="my-2 block text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        try {
          const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
          return (
            <span
              key={index}
              className="inline-block px-1 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      }

      // Teks biasa (cek apakah bagian ini mengandung Arab)
      const partHasArabic = containsArabic(part);
      if (partHasArabic) {
        return (
          <span 
            key={index} 
            className="font-serif text-lg leading-loose px-1 inline-block" 
            dir="rtl"
          >
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`leading-relaxed ${isArabic ? 'text-right font-serif' : ''} ${className}`}>
      {renderMathAndText()}
    </div>
  );
}
