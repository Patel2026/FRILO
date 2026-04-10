"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  rating: number;
  content: string;
  reviewerName: string;
  reviewerRole: string;
  templateName?: string | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'F';
}

export function TestimonialCard({
  rating,
  content,
  reviewerName,
  reviewerRole,
  templateName,
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col card-hover">
      <div className="flex gap-1 mb-5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={cn(
              'w-4 h-4',
              index < rating ? 'text-black fill-black' : 'text-gray-200 fill-gray-200'
            )}
          />
        ))}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed flex-grow mb-6">"{content}"</p>

      <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
        <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {getInitials(reviewerName)}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-black truncate">{reviewerName}</div>
          <div className="text-xs text-gray-400 truncate">
            {reviewerRole}
            {templateName ? ` · ${templateName}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
