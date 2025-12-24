'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Play, Loader2 } from 'lucide-react';
import { series as seriesApi, courses as coursesApi } from '@/lib/api';
import { VideoPlayer } from '@/features/video';
import { Button, LoadingScreen } from '@/components/ui';

function TrailerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const seriesId = searchParams.get('series');
  const courseId = searchParams.get('course');
  const directUrl = searchParams.get('url');

  useEffect(() => {
    async function fetchTrailer() {
      try {
        setIsLoading(true);

        if (directUrl) {
          setTrailerUrl(directUrl);
          setTitle('Trailer');
        } else if (seriesId) {
          const data = await seriesApi.getTrailer(Number(seriesId));
          setTrailerUrl(data.url);
          setTitle('Series Trailer');
        } else if (courseId) {
          const data = await coursesApi.getTrailer(Number(courseId));
          setTrailerUrl(data.url);
          setTitle('Course Trailer');
        } else {
          setError('No trailer specified');
        }
      } catch (err) {
        console.error('Failed to load trailer:', err);
        setError('Failed to load trailer');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrailer();
  }, [seriesId, courseId, directUrl]);

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading trailer..." />;
  }

  if (error || !trailerUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">{error || 'Trailer not available'}</p>
          <Button onClick={handleClose} variant="outline" className="text-white border-white">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Title */}
      <div className="fixed top-4 left-4 z-50">
        <h1 className="text-white text-lg font-medium">{title}</h1>
      </div>

      {/* Video Player */}
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl aspect-video">
          <VideoPlayer
            url_720={trailerUrl}
            autoplay={true}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function TrailerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <TrailerContent />
    </Suspense>
  );
}
