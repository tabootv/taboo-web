// ============================================
// Creator Profile Component - Patreon-style Landing Page
// Adapt this for Framer or use directly in React
// ============================================

import React, { useEffect, useState } from 'react';
import type { Creator, Video, Series } from './types';
import { creators } from './api';

interface CreatorProfileProps {
  creatorId: number;
}

export function CreatorProfile({ creatorId }: CreatorProfileProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch creator profile
        const creatorData = await creators.get(creatorId);
        setCreator(creatorData);

        // Fetch latest videos
        const videosData = await creators.getVideos(creatorId, { sort_by: 'newest' });
        setVideos(videosData.data?.slice(0, 6) || []);

        // Fetch series
        const seriesData = await creators.getSeries(creatorId, { sort_by: 'newest' });
        setSeries(seriesData.data?.slice(0, 4) || []);

      } catch (err) {
        console.error('Failed to fetch creator:', err);
        setError('Failed to load creator profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [creatorId]);

  if (isLoading) {
    return (
      <div className="creator-loading">
        <div className="loading-spinner"></div>
        <p>Loading creator profile...</p>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="creator-error">
        <p>{error || 'Creator not found'}</p>
      </div>
    );
  }

  return (
    <div className="creator-profile">
      {/* Hero Section with Banner */}
      <div className="creator-hero">
        <div
          className="creator-banner"
          style={{
            backgroundImage: creator.banner
              ? `url(${creator.banner})`
              : 'linear-gradient(135deg, #ab0013 0%, #7a000e 100%)'
          }}
        />
        <div className="creator-hero-content">
          <div className="creator-avatar">
            {creator.dp ? (
              <img src={creator.dp} alt={creator.name} />
            ) : (
              <div className="avatar-placeholder">
                {creator.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="creator-name">{creator.name}</h1>
          <p className="creator-bio">{creator.description}</p>

          {/* Stats */}
          <div className="creator-stats">
            <div className="stat">
              <span className="stat-value">{creator.videos_count || 0}</span>
              <span className="stat-label">Videos</span>
            </div>
            <div className="stat">
              <span className="stat-value">{creator.short_videos_count || creator.shorts_count || 0}</span>
              <span className="stat-label">Shorts</span>
            </div>
            <div className="stat">
              <span className="stat-value">{creator.series_count || 0}</span>
              <span className="stat-label">Series</span>
            </div>
            <div className="stat">
              <span className="stat-value">{creator.followers_count || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href={`https://app.taboo.tv/creators/creator-profile/${creatorId}`}
            className="cta-button"
          >
            View Full Profile on TabooTV
          </a>
        </div>
      </div>

      {/* Latest Videos Section */}
      {videos.length > 0 && (
        <section className="creator-section">
          <h2 className="section-title">Latest Videos</h2>
          <div className="video-grid">
            {videos.map((video) => (
              <a
                key={video.uuid}
                href={`https://app.taboo.tv/videos/${video.id}`}
                className="video-card"
              >
                <div className="video-thumbnail">
                  <img
                    src={video.thumbnail_webp || video.thumbnail}
                    alt={video.title}
                  />
                  {video.duration && (
                    <span className="video-duration">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>
                <h3 className="video-title">{video.title}</h3>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Series Section */}
      {series.length > 0 && (
        <section className="creator-section">
          <h2 className="section-title">Series</h2>
          <div className="series-grid">
            {series.map((item) => (
              <a
                key={item.uuid}
                href={`https://app.taboo.tv/series/${item.uuid}`}
                className="series-card"
              >
                <div className="series-thumbnail">
                  <img src={item.thumbnail} alt={item.title} />
                  <div className="series-overlay">
                    <span className="series-count">{item.videos_count} episodes</span>
                  </div>
                </div>
                <h3 className="series-title">{item.title}</h3>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="subscribe-section">
        <h2>Ready to unlock all content?</h2>
        <p>Subscribe to TabooTV for unlimited access to all creators</p>
        <a href="https://app.taboo.tv/plans" className="subscribe-button">
          Subscribe Now
        </a>
      </section>
    </div>
  );
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default CreatorProfile;
