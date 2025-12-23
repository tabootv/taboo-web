'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ChevronDown, Clapperboard } from 'lucide-react';
import { creators as creatorsApi } from '@/lib/api';
import type { Creator, Video, Series, Post } from '@/types';
import { LoadingScreen } from '@/components/ui';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';
import { CommunityPost } from '@/components/community';
import { useAuthStore } from '@/lib/stores';

type TabIndex = 0 | 1 | 2 | 3 | 4;
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
  const [coursesNextPage, setCoursesNextPage] = useState<string | null>(null);

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
        const creatorData = await creatorsApi.get(creatorId);
        setCreator(creatorData);
        setTabs([
          { label: 'Videos', count: creatorData.videos_count || 0 },
          { label: 'Shorts', count: creatorData.short_videos_count || 0 },
          { label: 'Series', count: creatorData.series_count || 0 },
          { label: 'Posts', count: creatorData.posts_count || 0 },
          { label: 'Education', count: creatorData.course_count || 0 },
        ]);
        // Fetch videos on mount
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

    if (activeTab === 0) getVideos(creatorId, null, sort);
    else if (activeTab === 1) getShorts(creatorId, null, sort);
    else if (activeTab === 2) getSeries(creatorId, null, sort);
    else if (activeTab === 3) getPosts(creatorId, null, sort);
    else if (activeTab === 4) getCourses(creatorId, null, sort);
  };

  const selectTab = (index: TabIndex) => {
    const creatorId = Number(channel);
    if (index === 0 && creatorVideos.length === 0) getVideos(creatorId);
    if (index === 1 && creatorShorts.length === 0) getShorts(creatorId);
    if (index === 2 && creatorSeries.length === 0) getSeries(creatorId);
    if (index === 3 && creatorPosts.length === 0) getPosts(creatorId);
    if (index === 4 && creatorCourses.length === 0) getCourses(creatorId);
    setActiveTab(index);
  };

  const getVideos = async (creatorId: number, nextPage?: string | null, sort?: SortBy) => {
    if (loadingStates.videos) return;
    setLoadingStates((prev) => ({ ...prev, videos: true }));
    try {
      const response = await creatorsApi.getVideos(creatorId, { sort_by: sort || sortBy, page_url: nextPage || undefined });
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
      const response = await creatorsApi.getShorts(creatorId, { sort_by: sort || sortBy, page_url: nextPage || undefined });
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
      const response = await creatorsApi.getSeries(creatorId, { sort_by: sort || sortBy, page_url: nextPage || undefined });
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
      const response = await creatorsApi.getPosts(creatorId, { sort_by: sort || sortBy, page_url: nextPage || undefined });
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
      const response = await creatorsApi.getCourses(creatorId, { sort_by: sort || sortBy, page_url: nextPage || undefined });
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
          <div className="creator-profile-card-bg">
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
            <div className="card-content">
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

            {/* Tabs */}
            <div className="creator-profile-tabs mb-3">
              {tabs.map((tab, index) => (
                <div
                  key={index}
                  className={`tabs-dimen ${activeTab === index ? 'active' : ''}`}
                  onClick={() => selectTab(index as TabIndex)}
                >
                  {tab.label}
                  <br />
                  <span>{tab.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Uploads Header */}
          <div className="flex items-center justify-between gap-3 mt-8">
            <h3 className="capitalize text-[18px] font-bold">uploads</h3>

            {/* Sort Dropdown */}
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

          {/* Tab Content */}
          <div className="mt-6 creator-tab-content">
            {/* Videos Tab */}
            {activeTab === 0 && (
              <div className="video-tab-content">
                {loadingStates.videos ? (
                  <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <VideoSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                      {creatorVideos.map((video) => (
                        <VideoCard key={video.uuid} video={video} />
                      ))}
                    </div>
                    {videosNextPage && (
                      <div className="flex items-center justify-center mt-5">
                        <button
                          onClick={() => getVideos(Number(channel), videosNextPage)}
                          disabled={loadingStates.videos}
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

            {/* Shorts Tab */}
            {activeTab === 1 && (
              <div className="short-tab-content">
                {loadingStates.shorts ? (
                  <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <ShortSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mt-4 xl:grid-cols-3 md:gap-4">
                      {creatorShorts.map((video) => (
                        <ShortCard key={video.uuid} video={video} />
                      ))}
                    </div>
                    {shortsNextPage && (
                      <div className="flex items-center justify-center mt-5">
                        <button
                          onClick={() => getShorts(Number(channel), shortsNextPage)}
                          disabled={loadingStates.shorts}
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

            {/* Series Tab */}
            {activeTab === 2 && (
              <div className="series-tab-content">
                {loadingStates.series ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-10 md:mt-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <VideoSkeleton key={index} />
                    ))}
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
            {activeTab === 3 && (
              <div className="posts-tab-content">
                {loadingStates.posts ? (
                  <div className="mt-4">
                    {Array.from({ length: 10 }).map((_, n) => (
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
                ) : (
                  <>
                    {creatorPosts.map((post, index) => (
                      <div key={post.id || index} className="mt-4 right-div-community">
                        <CommunityPost
                          post={post}
                          currentUserId={user?.id}
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
            {activeTab === 4 && (
              <div className="course-tab-content">
                {loadingStates.courses ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-10 md:mt-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <VideoSkeleton key={index} />
                    ))}
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
        <h3 className="font-medium text-white line-clamp-2 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
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
  return (
    <Link href={isCourse ? `/courses/${series.id}` : `/series/${series.uuid}`} className="group relative h-full">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {series.thumbnail && (
          <Image
            src={series.thumbnail}
            alt={series.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white line-clamp-2">{series.title}</h3>
          <p className="text-sm text-gray-300 mt-1">{series.videos_count} episodes</p>
        </div>
      </div>
    </Link>
  );
}
