'use client';

import { LoadingScreen } from '@/components/ui';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { CommunityPost } from '@/features/community';
import { useAuthStore } from '@/lib/stores';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import type { Creator, Post, Series, Video } from '@/types';
import { ChevronDown, Clapperboard, Play, Globe, ChevronRight, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { creatorsClient } from '@/api/client';

type TabIndex = 0 | 1 | 2 | 3 | 4 | 5;
type SortBy = 'newest' | 'trending' | 'old';

const sortingOptions = [
  { name: 'Newest', value: 'newest' as SortBy },
  { name: 'Oldest', value: 'old' as SortBy },
];

export default function CreatorProfilePage({ params }: { params: Promise<{ channel: string }> }) {
  const { channel } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Tab data
  const [creatorVideos, setCreatorVideos] = useState<Video[]>([]);
  const [creatorShorts, setCreatorShorts] = useState<Video[]>([]);
  const [creatorSeries, setCreatorSeries] = useState<Series[]>([]);
  const [creatorPosts, setCreatorPosts] = useState<Post[]>([]);
  const [creatorCourses, setCreatorCourses] = useState<Series[]>([]);

  // Next page URLs
  const [videosNextPage, setVideosNextPage] = useState<string | null>(null);
  const [shortsNextPage, setShortsNextPage] = useState<string | null>(null);
  const [seriesNextPage, setSeriesNextPage] = useState<string | null>(null);
  const [postsNextPage, setPostsNextPage] = useState<string | null>(null);
  const [_coursesNextPage, setCoursesNextPage] = useState<string | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    videos: false,
    shorts: false,
    series: false,
    posts: false,
    courses: false,
  });

  // Tab counts
  const [tabs, setTabs] = useState([
    { label: 'Home', count: 0, hideCount: true },
    { label: 'Videos', count: 0 },
    { label: 'Shorts', count: 0 },
    { label: 'Series', count: 0 },
    { label: 'Posts', count: 0 },
    { label: 'Education', count: 0 },
  ]);

  useEffect(() => {
    async function fetchCreator() {
      const creatorId = Number(channel);
      if (!channel || isNaN(creatorId)) {
        toast.error('Invalid creator');
        router.push('/creator');
        return;
      }

      try {
        setIsLoading(true);
        const creatorData = await creatorsClient.getProfile(creatorId);
        setCreator(creatorData);
        setTabs([
          { label: 'Home', count: 0, hideCount: true },
          { label: 'Videos', count: creatorData.videos_count || 0 },
          { label: 'Shorts', count: creatorData.short_videos_count || 0 },
          { label: 'Series', count: creatorData.series_count || 0 },
          { label: 'Posts', count: creatorData.posts_count || 0 },
          { label: 'Education', count: creatorData.course_count || 0 },
        ]);
        // Fetch videos on mount for Home tab
        getVideos(creatorId);
      } catch (error) {
        console.error('Failed to fetch creator:', error);
        toast.error('Failed to load creator profile');
        router.push('/creator');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreator();
  }, [channel, router]);

  const handleSortByChange = (value: SortBy) => {
    setSortBy(value);
    setShowSortDropdown(false);
    // Reset data and refetch for current tab
    resetAndRefetch(value);
  };

  const resetAndRefetch = (sort: SortBy) => {
    const creatorId = Number(channel);
    setCreatorVideos([]);
    setCreatorShorts([]);
    setCreatorSeries([]);
    setCreatorPosts([]);
    setCreatorCourses([]);
    setVideosNextPage(null);
    setShortsNextPage(null);
    setSeriesNextPage(null);
    setPostsNextPage(null);
    setCoursesNextPage(null);

    if (activeTab === 0) getVideos(creatorId, null, sort); // Home uses videos
    else if (activeTab === 1) getVideos(creatorId, null, sort);
    else if (activeTab === 2) getShorts(creatorId, null, sort);
    else if (activeTab === 3) getSeries(creatorId, null, sort);
    else if (activeTab === 4) getPosts(creatorId, null, sort);
    else if (activeTab === 5) getCourses(creatorId, null, sort);
  };

  const selectTab = (index: TabIndex) => {
    const creatorId = Number(channel);
    if (index === 0 && creatorVideos.length === 0) getVideos(creatorId); // Home uses videos
    if (index === 1 && creatorVideos.length === 0) getVideos(creatorId);
    if (index === 2 && creatorShorts.length === 0) getShorts(creatorId);
    if (index === 3 && creatorSeries.length === 0) getSeries(creatorId);
    if (index === 4 && creatorPosts.length === 0) getPosts(creatorId);
    if (index === 5 && creatorCourses.length === 0) getCourses(creatorId);
    setActiveTab(index);
  };

  const getVideos = async (creatorId: number, nextPage?: string | null, sort?: SortBy) => {
    if (loadingStates.videos) return;
    setLoadingStates((prev) => ({ ...prev, videos: true }));
    try {
      const response = await creatorsClient.getVideos(creatorId, { sort_by: sort || sortBy, ...(nextPage ? { page_url: nextPage } : {}) });
      if (nextPage) {
        setCreatorVideos((prev) => [...prev, ...(response.data || [])]);
      } else {
        setCreatorVideos(response.data || []);
      }
      setVideosNextPage(response.next_page_url || null);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, videos: false }));
    }
  };

  const getShorts = async (creatorId: number, nextPage?: string | null, sort?: SortBy) => {
    if (loadingStates.shorts) return;
    setLoadingStates((prev) => ({ ...prev, shorts: true }));
    try {
      const response = await creatorsClient.getShorts(creatorId, { sort_by: sort || sortBy, ...(nextPage ? { page_url: nextPage } : {}) });
      if (nextPage) {
        setCreatorShorts((prev) => [...prev, ...(response.data || [])]);
      } else {
        setCreatorShorts(response.data || []);
      }
      setShortsNextPage(response.next_page_url || null);
    } catch (error) {
      console.error('Failed to fetch shorts:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, shorts: false }));
    }
  };

  const getSeries = async (creatorId: number, nextPage?: string | null, sort?: SortBy) => {
    if (loadingStates.series) return;
    setLoadingStates((prev) => ({ ...prev, series: true }));
    try {
      const response = await creatorsClient.getSeries(creatorId, { sort_by: sort || sortBy, ...(nextPage ? { page_url: nextPage } : {}) });
      if (nextPage) {
        setCreatorSeries((prev) => [...prev, ...(response.data || [])]);
      } else {
        setCreatorSeries(response.data || []);
      }
      setSeriesNextPage(response.next_page_url || null);
    } catch (error) {
      console.error('Failed to fetch series:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, series: false }));
    }
  };

  const getPosts = async (creatorId: number, nextPage?: string | null, sort?: SortBy) => {
    if (loadingStates.posts) return;
    setLoadingStates((prev) => ({ ...prev, posts: true }));
    try {
      const response = await creatorsClient.getPosts(creatorId, { sort_by: sort || sortBy, ...(nextPage ? { page_url: nextPage } : {}) });
      if (nextPage) {
        setCreatorPosts((prev) => [...prev, ...(response.data || [])]);
      } else {
        setCreatorPosts(response.data || []);
      }
      setPostsNextPage(response.next_page_url || null);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, posts: false }));
    }
  };

  const getCourses = async (creatorId: number, nextPage?: string | null, sort?: SortBy) => {
    if (loadingStates.courses) return;
    setLoadingStates((prev) => ({ ...prev, courses: true }));
    try {
      const response = await creatorsClient.getCourses(creatorId, { sort_by: sort || sortBy, ...(nextPage ? { page_url: nextPage } : {}) });
      if (nextPage) {
        setCreatorCourses((prev) => [...prev, ...(response.data || [])]);
      } else {
        setCreatorCourses(response.data || []);
      }
      setCoursesNextPage(response.next_page_url || null);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, courses: false }));
    }
  };

  const handleDeletePost = (id: number) => {
    setCreatorPosts((prev) => prev.filter((post) => post.id !== id));
  };

  // Infinite scroll refs
  const videosLoaderRef = useRef<HTMLDivElement>(null);
  const shortsLoaderRef = useRef<HTMLDivElement>(null);

  // Infinite scroll for Videos
  const loadMoreVideos = useCallback(() => {
    if (videosNextPage && !loadingStates.videos) {
      getVideos(Number(channel), videosNextPage);
    }
  }, [videosNextPage, loadingStates.videos, channel]);

  // Infinite scroll for Shorts
  const loadMoreShorts = useCallback(() => {
    if (shortsNextPage && !loadingStates.shorts) {
      getShorts(Number(channel), shortsNextPage);
    }
  }, [shortsNextPage, loadingStates.shorts, channel]);

  // Videos infinite scroll observer
  useEffect(() => {
    if (activeTab !== 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );
    if (videosLoaderRef.current) {
      observer.observe(videosLoaderRef.current);
    }
    return () => observer.disconnect();
  }, [activeTab, loadMoreVideos]);

  // Shorts infinite scroll observer
  useEffect(() => {
    if (activeTab !== 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreShorts();
        }
      },
      { threshold: 0.1 }
    );
    if (shortsLoaderRef.current) {
      observer.observe(shortsLoaderRef.current);
    }
    return () => observer.disconnect();
  }, [activeTab, loadMoreShorts]);

  if (isLoading) {
    return <LoadingScreen message="Loading creator..." />;
  }

  if (!creator) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Creator not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Main Content */}
        <div>
          {/* Creator Profile Card */}
          <div className="bg-surface/30 rounded-2xl overflow-hidden border border-white/5">
            {/* Banner */}
            <div className="relative h-[100px] md:h-[150px] w-full">
              {creator.banner ? (
                <Image
                  src={creator.banner}
                  alt=""
                  fill
                  className="object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-red-dark to-red-primary" />
              )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start">
              {/* Avatar */}
              <div className="relative size-[88px] md:size-[120px] rounded-full overflow-hidden border-4 border-surface -mt-[60px] md:-mt-[80px] bg-surface flex-shrink-0">
                {creator.dp ? (
                  <Image
                    src={creator.dp}
                    alt={creator.name || 'Creator'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {(creator.name || 'C').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full">
                <div className="flex items-center gap-[10px]">
                  <h2 className="text-[20px] font-medium text-white">{creator.name}</h2>
                  <VerifiedBadge size={16} />
                  {user?.channel?.id === creator.id && (
                    <Link href="/studio">
                      <button className="btn btn-primary btn-sm px-4 flex items-center gap-2">
                        <Clapperboard className="w-4 h-4" />
                        Creator Studio
                      </button>
                    </Link>
                  )}
                  {creator.paypal_link && (
                    <a
                      href={creator.paypal_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="btn btn-primary btn-sm px-6">
                        Donate
                      </button>
                    </a>
                  )}
                </div>
                <p className="mt-1 md:mt-5 text-[16px] font-normal text-[#DCDCDC]">
                  {creator.description}
                </p>
              </div>
            </div>

          </div>

          {/* Modern Tab Navigation */}
          <div className="mt-6 border-b border-white/10">
            <nav className="flex gap-1 overflow-x-auto hide-scrollbar">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => selectTab(index as TabIndex)}
                  className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    activeTab === index
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {!('hideCount' in tab && tab.hideCount) && tab.count > 0 && (
                      <span className={`text-xs ${activeTab === index ? 'text-white/70' : 'text-white/40'}`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {/* Active indicator */}
                  {activeTab === index && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-primary rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Sort Controls - Hidden on Home tab */}
          {activeTab !== 0 && (
            <div className="flex items-center justify-end mt-6">
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm"
                >
                  Sort by: {sortingOptions.find((o) => o.value === sortBy)?.name}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                      {sortingOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortByChange(option.value)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-hover transition-colors ${
                            sortBy === option.value ? 'text-red-primary' : 'text-white'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="mt-4">
            {/* Home Tab */}
            {activeTab === 0 && (
              <div className="space-y-8">
                {loadingStates.videos ? (
                  <HomeSkeleton />
                ) : creatorVideos.length > 0 ? (
                  <HomeTabContent
                    videos={creatorVideos}
                    onShowMore={() => selectTab(1)}
                  />
                ) : (
                  <div className="text-center py-12 text-white/40">
                    No videos yet
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 1 && (
              <div>
                {creatorVideos.length === 0 && !loadingStates.videos ? (
                  <div className="text-center py-12 text-white/40">
                    Creator doesn&apos;t have any videos yet
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                      {creatorVideos.map((video) => (
                        <VideoCard key={video.uuid} video={video} />
                      ))}
                    </div>
                    {/* Infinite scroll trigger */}
                    {videosNextPage && (
                      <div ref={videosLoaderRef} className="py-8">
                        {loadingStates.videos && (
                          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3 md:gap-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <VideoSkeleton key={index} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {loadingStates.videos && creatorVideos.length === 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <VideoSkeleton key={index} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Shorts Tab */}
            {activeTab === 2 && (
              <div>
                {creatorShorts.length === 0 && !loadingStates.shorts ? (
                  <div className="text-center py-12 text-white/40">
                    Creator doesn&apos;t have any shorts yet
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                      {creatorShorts.map((video) => (
                        <ShortCard key={video.uuid} video={video} />
                      ))}
                    </div>
                    {/* Infinite scroll trigger */}
                    {shortsNextPage && (
                      <div ref={shortsLoaderRef} className="py-8">
                        {loadingStates.shorts && (
                          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3 md:gap-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <ShortSkeleton key={index} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {loadingStates.shorts && creatorShorts.length === 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <ShortSkeleton key={index} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Series Tab */}
            {activeTab === 3 && (
              <div>
                {loadingStates.series ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-10 md:mt-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <VideoSkeleton key={index} />
                    ))}
                  </div>
                ) : creatorSeries.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    Creator doesn&apos;t have any series yet
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-10 md:mt-4">
                      {creatorSeries.map((series) => (
                        <SeriesCard key={series.uuid} series={series} />
                      ))}
                    </div>
                    {seriesNextPage && (
                      <div className="flex items-center justify-center mt-5">
                        <button
                          onClick={() => getSeries(Number(channel), seriesNextPage)}
                          disabled={loadingStates.series}
                          className="px-4 py-2 bg-transparent text-white hover:text-red-primary"
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 4 && (
              <div>
                {loadingStates.posts ? (
                  <div className="mt-4">
                    {Array.from({ length: 3 }).map((_, n) => (
                      <div key={n} className="right-div-community">
                        <div className="comment-div w-full">
                          <div className="size-[60px] rounded-full bg-gray-700 animate-pulse" />
                          <div className="w-full">
                            <div className="flex items-center gap-1 mb-1 mt-4">
                              <div className="w-[120px] h-5 bg-gray-700 rounded animate-pulse" />
                              <div className="w-[80px] h-5 bg-gray-700 rounded animate-pulse ml-2" />
                            </div>
                            <div className="w-full h-5 bg-gray-700 rounded animate-pulse my-4" />
                            <div className="flex items-center gap-2 mt-4">
                              <div className="w-10 h-8 bg-gray-700 rounded animate-pulse" />
                              <div className="w-10 h-8 bg-gray-700 rounded animate-pulse" />
                              <div className="w-10 h-8 bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : creatorPosts.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    Creator doesn&apos;t have any posts yet
                  </div>
                ) : (
                  <>
                    {creatorPosts.map((post, index) => (
                      <div key={post.id || index} className="mt-4 right-div-community">
                        <CommunityPost
                          post={post}
                          {...(user?.id ? { currentUserId: user.id } : {})}
                          onDelete={handleDeletePost}
                        />
                      </div>
                    ))}
                    {postsNextPage && (
                      <div className="flex items-center justify-center mt-5">
                        <button
                          onClick={() => getPosts(Number(channel), postsNextPage)}
                          disabled={loadingStates.posts}
                          className="px-4 py-2 bg-transparent text-white hover:text-red-primary"
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 5 && (
              <div>
                {loadingStates.courses ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-10 md:mt-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <VideoSkeleton key={index} />
                    ))}
                  </div>
                ) : creatorCourses.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    Creator doesn&apos;t have any courses yet
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-10 md:mt-4">
                    {creatorCourses.map((course) => (
                      <SeriesCard key={course.uuid} series={course} isCourse />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="overflow-visible relative">
      <div className="h-[251px] w-full bg-gray-700 rounded-lg animate-pulse" />
      <div className="h-[15px] w-full bg-gray-700 rounded-[20px] animate-pulse mt-2" />
      <div className="h-[15px] w-[120px] bg-gray-700 rounded-[20px] animate-pulse mt-2" />
    </div>
  );
}

function ShortSkeleton() {
  return (
    <div className="overflow-visible relative">
      <div className="aspect-[9/16] w-full bg-gray-700 rounded-lg animate-pulse" />
      <div className="h-[15px] w-full bg-gray-700 rounded-[20px] animate-pulse mt-2" />
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const publishedLabel = video.published_at ? formatRelativeTime(video.published_at) : null;

  return (
    <Link href={`/videos/${video.id}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
            {formatDuration(video.duration)}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="p-2 bg-red-primary/80 rounded-full">
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-[13px] md:text-sm font-medium text-white leading-snug line-clamp-3 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        {publishedLabel && (
          <p className="text-xs text-white/40 mt-0.5">{publishedLabel}</p>
        )}
      </div>
    </Link>
  );
}

function ShortCard({ video }: { video: Video }) {
  return (
    <Link
      href={`/shorts/${video.uuid}`}
      className="group relative overflow-hidden cursor-pointer rounded-[8px]"
    >
      <div className="relative aspect-[9/16] w-full">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover rounded-[8px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute z-20 left-3 right-3 bottom-3">
          <p className="font-medium text-[18px] leading-6 line-clamp-2 group-hover:text-red-primary transition-colors">
            {video.title}
          </p>
        </div>
      </div>
    </Link>
  );
}

function SeriesCard({ series, isCourse }: { series: Series; isCourse?: boolean }) {
  // Courses use numeric ID for routing since the backend /courses/{id} endpoint expects numeric ID
  const thumbnail = series.trailer_thumbnail || series.thumbnail || series.card_thumbnail;
  const videoCount = series.videos_count || 0;

  return (
    <Link
      href={isCourse ? `/courses/${series.id}` : `/series/${series.uuid}`}
      className="series-card-clean group"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={series.title}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-dark to-red-primary" />
        )}

        <div className="absolute top-3 left-3 series-type-badge">
          <Play className="w-3 h-3 fill-white" />
          {isCourse ? 'Course' : 'Series'}
        </div>
      </div>

      <div className="p-4 flex flex-col">
        <h3 className="text-base font-medium text-white line-clamp-2 min-h-12 group-hover:text-red-primary transition-colors">
          {series.title}
        </h3>

        <div className="flex items-center justify-end mt-auto pt-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
            <Play className="w-3 h-3 text-red-primary fill-red-primary" />
            <span className="text-xs font-medium text-white/80">
              {videoCount} {videoCount === 1 ? 'episode' : 'episodes'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Skeleton */}
      <div>
        <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4" />
        <div className="aspect-video w-full bg-gray-700 rounded-xl animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-700 rounded-full animate-pulse mt-3" />
        </div>
      </div>
      {/* Rail Skeleton */}
      <div>
        <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px]">
              <div className="aspect-video bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-gray-700 rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeTabContent({ videos, onShowMore }: { videos: Video[]; onShowMore: () => void }) {
  const latestVideo = videos[0];
  const remainingVideos = videos.slice(1, 9); // Show up to 8 videos in the rail

  // Early return if no videos (shouldn't happen as parent checks this)
  if (!latestVideo) return null;

  // Type assertion for optional properties that might exist on the API response
  const videoLocation = (latestVideo as Video & { location?: string }).location;
  const videoPremium = (latestVideo as Video & { is_premium?: boolean }).is_premium;

  return (
    <>
      {/* Latest Release Hero */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Latest Release</h2>
        <Link href={`/videos/${latestVideo.id}`} className="group block">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-surface">
            {latestVideo.thumbnail && (
              <Image
                src={latestVideo.thumbnail_webp || latestVideo.thumbnail}
                alt={latestVideo.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-primary/90 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Premium Badge */}
            {videoPremium && (
              <div className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg">
                <Lock className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-red-primary transition-colors line-clamp-2">
              {latestVideo.title}
            </h3>
            {latestVideo.description && (
              <p className="mt-2 text-sm text-white/60 line-clamp-2">
                {latestVideo.description}
              </p>
            )}
            {videoLocation && (
              <div className="flex items-center gap-1.5 mt-3">
                <Globe className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {videoLocation}
                </span>
              </div>
            )}
          </div>
        </Link>
      </section>

      {/* Latest Videos Rail */}
      {remainingVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Latest Videos</h2>
            <button
              onClick={onShowMore}
              className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
            >
              Show more
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {remainingVideos.map((video) => {
              const location = (video as Video & { location?: string }).location;
              const isPremium = (video as Video & { is_premium?: boolean }).is_premium;
              return (
                <Link
                  key={video.uuid}
                  href={`/videos/${video.id}`}
                  className="group flex-shrink-0 w-[200px]"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
                    {video.thumbnail && (
                      <Image
                        src={video.thumbnail_webp || video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {/* Premium Badge */}
                    {isPremium && (
                      <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Location Badge */}
                    {location && (
                      <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded uppercase font-medium">
                        {location}
                      </div>
                    )}
                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 text-[10px] text-white bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-white line-clamp-2 group-hover:text-red-primary transition-colors">
                    {video.title}
                  </h4>
                  {video.published_at && (
                    <p className="text-xs text-white/40 mt-0.5">{formatRelativeTime(video.published_at)}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
