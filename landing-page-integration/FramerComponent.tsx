// ============================================
// Framer Code Component - Creator Landing Page
// Netflix-style cinematic design with tabs
// Uses PUBLIC API - No authentication required!
// ============================================

import { useState, useEffect } from "react"

// Uncomment these when pasting into Framer:
// import { addPropertyControls, ControlType } from "framer"

const API_URL = "https://app.taboo.tv/api/public"

// ============================================
// API FUNCTIONS
// ============================================

// Fetch creator profile with stats and social links
async function getCreatorProfile(creatorId: number) {
    const response = await fetch(`${API_URL}/creators?id=${creatorId}`, {
        headers: { Accept: "application/json" },
    })
    const data = await response.json()
    // The API returns { success: true, data: { creators: [...] } }
    const creators = data?.data?.creators || data?.creators || []
    return creators[0] || null
}

async function getCreatorData(channelId: number) {
    // Fetch creator profile, regular videos, and shorts in parallel
    const [creatorProfile, videosRes, shortsRes] = await Promise.all([
        getCreatorProfile(channelId),
        fetch(`${API_URL}/map-videos?creators=${channelId}&short=false&sort_by=latest&per_page=60`, {
            headers: { Accept: "application/json" },
        }),
        fetch(`${API_URL}/map-videos?creators=${channelId}&short=true&sort_by=latest&per_page=60`, {
            headers: { Accept: "application/json" },
        }),
    ])

    const videosData = await videosRes.json()
    const shortsData = await shortsRes.json()

    // Videos should already be filtered by the creators param
    const regularVideos = videosData?.videos || []
    const shortVideos = shortsData?.videos || []

    const allVideos = [...regularVideos, ...shortVideos]
    // Use creator profile from /creators endpoint, fallback to channel from videos
    const creator = creatorProfile || allVideos[0]?.channel || null

    return { creator, regularVideos, shortVideos, allVideos }
}

// Shuffle array for random shorts
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}

// ============================================
// ICONS
// ============================================
const Icons = {
    verified: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ab0013">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <circle cx="12" cy="12" r="10" fill="#ab0013" />
            <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    // Social Media Icons
    x: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
    ),
    tiktok: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
    ),
    instagram: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
    ),
    facebook: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    ),
    youtube: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    ),
    play: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    playSmall: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    lock: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
    videoIcon: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <polygon
                points="5,3 19,12 5,21"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    ),
    shortsIcon: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
        </svg>
    ),
    globeIcon: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    ),
    chevronRight: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M9 18l6-6-6-6" />
        </svg>
    ),
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CreatorLanding({ creatorId = 1 }) {
    const [creator, setCreator] = useState<any>(null)
    const [longVideos, setLongVideos] = useState<any[]>([])
    const [shortVideos, setShortVideos] = useState<any[]>([])
    const [allVideos, setAllVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [activeTab, setActiveTab] = useState<"home" | "videos" | "shorts">("home")
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    const fetchData = () => {
        setLoading(true)
        setError(false)
        getCreatorData(creatorId)
            .then(({ creator, regularVideos, shortVideos, allVideos }) => {
                setCreator(creator)
                setLongVideos(regularVideos)
                setShortVideos(shortVideos)
                setAllVideos(allVideos)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
                setError(true)
            })
    }

    useEffect(() => {
        fetchData()
    }, [creatorId])

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        )
    }

    if (error || !creator) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.errorContent}>
                    <p style={styles.errorText}>
                        {error ? "Failed to load creator" : "Creator not found"}
                    </p>
                    <button
                        onClick={fetchData}
                        style={styles.retryBtn}
                        className="retry-hover"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // ---------- DERIVED DATA ----------
    // Use stats from creator profile API, fallback to counting videos
    const stats = [
        { key: "videos", label: "Videos", value: creator?.total_videos ?? longVideos.length, icon: Icons.videoIcon },
        { key: "shorts", label: "Shorts", value: creator?.total_shorts ?? shortVideos.length, icon: Icons.shortsIcon },
        { key: "countries", label: "Countries Recorded", value: creator?.countries_recorded ?? 0, icon: Icons.globeIcon },
    ].filter((s) => Number(s.value) > 0)

    // Social media links from creator profile
    // API returns handles, so we construct full URLs
    const buildSocialUrl = (platform: string, handle: string | null | undefined): string | null => {
        if (!handle) return null
        // If it's already a full URL, return as-is
        if (handle.startsWith("http://") || handle.startsWith("https://")) return handle
        // Remove @ prefix if present
        const cleanHandle = handle.replace(/^@/, "")
        switch (platform) {
            case "x": return `https://x.com/${cleanHandle}`
            case "tiktok": return `https://tiktok.com/@${cleanHandle}`
            case "instagram": return `https://instagram.com/${cleanHandle}`
            case "facebook": return `https://facebook.com/${cleanHandle}`
            case "youtube": return `https://youtube.com/@${cleanHandle}`
            default: return null
        }
    }

    const socialLinks = [
        { key: "x", url: buildSocialUrl("x", creator?.x), icon: Icons.x, label: "X" },
        { key: "tiktok", url: buildSocialUrl("tiktok", creator?.tiktok), icon: Icons.tiktok, label: "TikTok" },
        { key: "instagram", url: buildSocialUrl("instagram", creator?.instagram), icon: Icons.instagram, label: "Instagram" },
        { key: "facebook", url: buildSocialUrl("facebook", creator?.facebook), icon: Icons.facebook, label: "Facebook" },
        { key: "youtube", url: buildSocialUrl("youtube", creator?.youtube), icon: Icons.youtube, label: "YouTube" },
    ].filter((s) => s.url)

    const featuredVideo = longVideos[0]
    const latestVideos = longVideos.slice(1, 9)
    const randomShorts = shuffleArray(shortVideos).slice(0, 18)
    const allTags = Array.from(new Set(longVideos.flatMap((v: any) => v.tags || []))).sort()
    const filteredVideos = selectedTag
        ? longVideos.filter((v: any) => v.tags?.includes(selectedTag))
        : longVideos

    return (
        <div style={styles.page}>
            <style>{`
                html { scroll-behavior: smooth; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
                .card-hover:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 8px 30px rgba(171, 0, 19, 0.2); }
                .btn-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
                .btn-hover:hover { transform: scale(1.03); box-shadow: 0 6px 20px rgba(171, 0, 19, 0.35); }
                .btn-hover:active { transform: scale(0.98); }
                .retry-hover:hover { background: #c41420 !important; transform: scale(1.05); }
                .tab-hover:hover { color: rgba(255,255,255,0.8) !important; }
                .tag-hover:hover { background: rgba(255,255,255,0.15) !important; border-color: rgba(255,255,255,0.25) !important; }
                .link-hover:hover { color: #fff !important; }
                .social-hover { transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease; }
                .social-hover:hover { transform: scale(1.15); color: #fff !important; background: rgba(171, 0, 19, 0.3) !important; }
                .short-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
                .short-hover:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(171, 0, 19, 0.25); }
                @media (max-width: 1200px) { .videos-grid { grid-template-columns: repeat(3, 1fr) !important; } .shorts-grid { grid-template-columns: repeat(5, 1fr) !important; } }
                @media (max-width: 900px) { .videos-grid { grid-template-columns: repeat(2, 1fr) !important; } .shorts-grid { grid-template-columns: repeat(4, 1fr) !important; } }
                @media (max-width: 600px) { .videos-grid { grid-template-columns: repeat(2, 1fr) !important; } .shorts-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                @media (max-width: 400px) { .videos-grid { grid-template-columns: 1fr !important; } .shorts-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                .touch-scroll { -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; }
                .touch-scroll > * { scroll-snap-align: start; }
            `}</style>

            {/* HERO SECTION */}
            <section style={styles.hero}>
                <div style={styles.heroBg}>
                    {featuredVideo?.thumbnail && (
                        <img src={featuredVideo.thumbnail} alt="" style={styles.heroBgImg} />
                    )}
                    <div style={styles.heroGradient} />
                    <div style={styles.heroGrain} />
                </div>

                <div style={styles.heroContent}>
                    <div style={styles.heroLeft}>
                        <div style={styles.avatarWrapper}>
                            <img src={creator.dp} alt={creator.name} style={styles.heroAvatar} />
                        </div>

                        <div style={styles.nameRow}>
                            <h1 style={styles.heroName}>{creator.name}</h1>
                            <span style={styles.verifiedBadge}>{Icons.verified}</span>
                        </div>

                        <p style={styles.heroTagline}>
                            {creator.description?.slice(0, 100) || "Raw travel documentaries from the world's most dangerous places"}
                        </p>

                        {stats.length > 0 && (
                            <p style={styles.heroStats}>
                                {stats.map((s, idx) => (
                                    <span key={s.key} style={styles.statItem}>
                                        <span style={styles.statIcon}>{s.icon}</span>
                                        <span>{s.value} {s.label}</span>
                                        {idx < stats.length - 1 && <span style={styles.statDivider}> • </span>}
                                    </span>
                                ))}
                            </p>
                        )}

                        {socialLinks.length > 0 && (
                            <div style={styles.socialLinks}>
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.key}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.socialLink}
                                        className="social-hover"
                                        title={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        )}

                        <div style={styles.heroCtas}>
                            <a href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.primaryCta} className="btn-hover">
                                Start watching on Taboo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* TABS */}
            <section style={styles.tabsWrap}>
                <div style={styles.tabsRow}>
                    {[
                        { key: "home", label: "Home" },
                        { key: "videos", label: "Videos" },
                        ...(shortVideos.length > 0 ? [{ key: "shorts", label: "Shorts" }] : []),
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key as any)}
                            style={{ ...styles.tabBtn, ...(activeTab === t.key ? styles.tabBtnActive : {}) }}
                            className="tab-hover"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* HOME TAB */}
            {activeTab === "home" && (
                <>
                    {featuredVideo && (
                        <section style={styles.featuredSection}>
                            <div style={styles.featuredContainer}>
                                <h2 style={styles.sectionTitle}>Latest Release</h2>
                                <a href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.featuredVideoCard} className="card-hover">
                                    <div style={styles.featuredVideoThumb}>
                                        <img src={featuredVideo.thumbnail} alt={featuredVideo.title} style={styles.featuredVideoImg} />
                                        <div style={styles.featuredVideoOverlaySimple}>
                                            <div style={styles.playCircle}>{Icons.play}</div>
                                        </div>
                                        <span style={styles.lockBadgeLarge}>{Icons.lock}</span>
                                        {featuredVideo.duration && (
                                            <span style={styles.durationBadgeLarge}>{formatDuration(featuredVideo.duration)}</span>
                                        )}
                                    </div>
                                    <div style={styles.featuredInfoBelow}>
                                        <h3 style={styles.featuredTitleBelow}>{featuredVideo.title}</h3>
                                        {featuredVideo.description && <p style={styles.featuredDescBelow}>{featuredVideo.description}</p>}
                                        {featuredVideo.country && (
                                            <span style={styles.featuredLocation}>{Icons.globeIcon} {featuredVideo.country}</span>
                                        )}
                                    </div>
                                </a>
                            </div>
                        </section>
                    )}

                    {latestVideos.length > 0 && (
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}>Latest Videos</h2>
                            <div style={styles.latestRail} className="touch-scroll hide-scrollbar">
                                {latestVideos.slice(0, 7).map((video: any) => (
                                    <a key={video.uuid} href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.latestCardRail} className="card-hover">
                                        <div style={styles.latestThumb}>
                                            <img loading="lazy" src={video.thumbnail} alt={video.title} style={styles.latestImg} />
                                            <span style={styles.lockBadge}>{Icons.lock}</span>
                                            {video.duration && <span style={styles.durationBadge}>{formatDuration(video.duration)}</span>}
                                            {video.country && <span style={styles.locationTag}>{video.country}</span>}
                                        </div>
                                        <h4 style={styles.latestTitle}>{video.title}</h4>
                                    </a>
                                ))}
                            </div>
                            <div style={styles.viewAllRow}>
                                <button onClick={() => setActiveTab("videos")} style={styles.viewAllLink} className="link-hover">
                                    Show more {Icons.chevronRight}
                                </button>
                            </div>
                        </section>
                    )}

                    {shortVideos.length > 0 && (
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Shorts</h2>
                                <button onClick={() => setActiveTab("shorts")} style={styles.viewAllLink} className="link-hover">
                                    View all {Icons.chevronRight}
                                </button>
                            </div>
                            <div style={styles.shortsRail} className="touch-scroll hide-scrollbar">
                                {shortVideos.slice(0, 8).map((video: any, index: number) => (
                                    <a key={video.id || video.uuid || index} href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.shortCard} className="short-hover">
                                        <img loading="lazy" src={video.thumbnail} alt={video.title || ""} style={styles.shortImg} />
                                        <div style={styles.shortOverlay} />
                                        <span style={styles.lockBadgeShort}>{Icons.lock}</span>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    <section style={styles.globeSection}>
                        <div style={styles.globeContainer}>
                            <div style={styles.globeContent}>
                                <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Explore the Globe</h2>
                                <p style={styles.globeText}>Follow the footsteps of {creator.name} around the world</p>
                                <a href="https://taboo.tv/globe" target="_blank" rel="noopener noreferrer" style={styles.globeCta} className="btn-hover">
                                    Check now
                                </a>
                            </div>
                            <div style={styles.globePreviewStatic}>
                                <style>{`
                                    @keyframes rotateGlobe { from { background-position: 0 0; } to { background-position: 630px 0; } }
                                    @keyframes pulseDot { 0%, 100% { transform: scale(1); box-shadow: 0 0 4px #e11d48, 0 0 8px rgba(225, 29, 72, 0.6), 0 0 12px rgba(171, 0, 19, 0.4); } 50% { transform: scale(1.3); box-shadow: 0 0 6px #e11d48, 0 0 12px rgba(225, 29, 72, 0.8), 0 0 20px rgba(171, 0, 19, 0.6); } }
                                    @keyframes dotRipple { 0% { width: 100%; height: 100%; opacity: 0.8; } 100% { width: 300%; height: 300%; opacity: 0; } }
                                    @keyframes rotateDots { from { transform: translateX(0); } to { transform: translateX(-630px); } }
                                `}</style>
                                <div style={styles.globeGlow} />
                                <div style={styles.globeAtmosphere} />
                                <div style={styles.globe}>
                                    <div style={styles.globeMap} />
                                    <div style={styles.globeMask}>
                                        <div style={styles.globeDots}>
                                            {/* Original dots */}
                                            <div style={{ ...styles.dot, top: 84, left: 139 }}><div style={styles.dotRipple} /></div>
                                            <div style={{ ...styles.dot, top: 132, left: 202, animationDelay: "0.3s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.3s" }} /></div>
                                            <div style={{ ...styles.dot, top: 72, left: 302, animationDelay: "0.6s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.6s" }} /></div>
                                            <div style={{ ...styles.dot, top: 96, left: 365, animationDelay: "0.9s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.9s" }} /></div>
                                            {/* Additional dots - first half */}
                                            <div style={{ ...styles.dot, top: 52, left: 178, animationDelay: "0.2s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.2s" }} /></div>
                                            <div style={{ ...styles.dot, top: 168, left: 145, animationDelay: "0.5s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.5s" }} /></div>
                                            <div style={{ ...styles.dot, top: 108, left: 268, animationDelay: "0.7s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.7s" }} /></div>
                                            <div style={{ ...styles.dot, top: 156, left: 312, animationDelay: "1.1s" }}><div style={{ ...styles.dotRipple, animationDelay: "1.1s" }} /></div>
                                            <div style={{ ...styles.dot, top: 64, left: 385, animationDelay: "0.4s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.4s" }} /></div>
                                            <div style={{ ...styles.dot, top: 188, left: 248, animationDelay: "0.8s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.8s" }} /></div>
                                            <div style={{ ...styles.dot, top: 42, left: 335, animationDelay: "1.2s" }}><div style={{ ...styles.dotRipple, animationDelay: "1.2s" }} /></div>
                                            <div style={{ ...styles.dot, top: 124, left: 418, animationDelay: "0.15s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.15s" }} /></div>
                                            <div style={{ ...styles.dot, top: 76, left: 455, animationDelay: "0.55s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.55s" }} /></div>
                                            <div style={{ ...styles.dot, top: 148, left: 168, animationDelay: "0.95s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.95s" }} /></div>
                                            <div style={{ ...styles.dot, top: 92, left: 498, animationDelay: "1.3s" }}><div style={{ ...styles.dotRipple, animationDelay: "1.3s" }} /></div>
                                            <div style={{ ...styles.dot, top: 176, left: 388, animationDelay: "0.25s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.25s" }} /></div>
                                            <div style={{ ...styles.dot, top: 58, left: 225, animationDelay: "0.65s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.65s" }} /></div>
                                            <div style={{ ...styles.dot, top: 138, left: 478, animationDelay: "1.05s" }}><div style={{ ...styles.dotRipple, animationDelay: "1.05s" }} /></div>
                                            <div style={{ ...styles.dot, top: 196, left: 355, animationDelay: "0.45s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.45s" }} /></div>
                                            <div style={{ ...styles.dot, top: 68, left: 528, animationDelay: "0.85s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.85s" }} /></div>
                                            {/* Duplicates for seamless loop */}
                                            <div style={{ ...styles.dot, top: 84, left: 769 }}><div style={styles.dotRipple} /></div>
                                            <div style={{ ...styles.dot, top: 132, left: 832, animationDelay: "0.3s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.3s" }} /></div>
                                            <div style={{ ...styles.dot, top: 52, left: 808, animationDelay: "0.2s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.2s" }} /></div>
                                            <div style={{ ...styles.dot, top: 168, left: 775, animationDelay: "0.5s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.5s" }} /></div>
                                            <div style={{ ...styles.dot, top: 108, left: 898, animationDelay: "0.7s" }}><div style={{ ...styles.dotRipple, animationDelay: "0.7s" }} /></div>
                                            <div style={{ ...styles.dot, top: 156, left: 942, animationDelay: "1.1s" }}><div style={{ ...styles.dotRipple, animationDelay: "1.1s" }} /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={styles.subscribeCta}>
                        <div style={styles.subscribeContent}>
                            <h2 style={styles.subscribeTitle}>Ready to unlock all content?</h2>
                            <p style={styles.subscribeSubtext}>Subscribe to TabooTV for unlimited access to all creators.</p>
                            <a href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.subscribeBtn} className="btn-hover">
                                Subscribe Now
                            </a>
                        </div>
                    </section>
                </>
            )}

            {/* VIDEOS TAB */}
            {activeTab === "videos" && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Videos</h2>
                    {allTags.length > 0 && (
                        <div style={styles.tagsRow}>
                            <button onClick={() => setSelectedTag(null)} style={{ ...styles.tagChip, ...(selectedTag === null ? styles.tagChipActive : {}) }} className="tag-hover">All</button>
                            {allTags.map((tag: string) => (
                                <button key={tag} onClick={() => setSelectedTag(tag)} style={{ ...styles.tagChip, ...(selectedTag === tag ? styles.tagChipActive : {}) }} className="tag-hover">{tag}</button>
                            ))}
                        </div>
                    )}
                    {filteredVideos.length === 0 ? (
                        <p style={styles.emptyState}>{selectedTag ? `No videos with tag "${selectedTag}"` : "No videos published yet."}</p>
                    ) : (
                        <div style={styles.latestGrid} className="videos-grid">
                            {filteredVideos.slice(0, 18).map((video: any) => (
                                <a key={video.uuid} href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.latestCard} className="card-hover">
                                    <div style={styles.latestThumb}>
                                        <img loading="lazy" src={video.thumbnail} alt={video.title} style={styles.latestImg} />
                                        <span style={styles.lockBadge}>{Icons.lock}</span>
                                        {video.duration && <span style={styles.durationBadge}>{formatDuration(video.duration)}</span>}
                                        {video.country && <span style={styles.locationTag}>{video.country}</span>}
                                    </div>
                                    <h4 style={styles.latestTitle}>{video.title}</h4>
                                </a>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* SHORTS TAB */}
            {activeTab === "shorts" && shortVideos.length > 0 && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Shorts</h2>
                    <div style={styles.shortsGrid} className="shorts-grid">
                        {randomShorts.map((video: any, index: number) => (
                            <a key={video.id || video.uuid || index} href="https://taboo.tv/choose-plan" target="_blank" rel="noopener noreferrer" style={styles.shortCardGrid} className="short-hover">
                                <img loading="lazy" src={video.thumbnail} alt={video.title || ""} style={styles.shortImg} />
                                <div style={styles.shortOverlay} />
                                <span style={styles.lockBadgeShort}>{Icons.lock}</span>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

// ============================================
// PROPERTY CONTROLS (for Framer)
// ============================================
// Uncomment when using in Framer:
/*
addPropertyControls(CreatorLanding, {
    creatorId: {
        type: ControlType.Number,
        title: "Creator ID",
        defaultValue: 1,
        min: 1,
        step: 1,
    },
})
*/

// ============================================
// STYLES
// ============================================
const styles: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    loadingContainer: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#666", fontSize: 14 },
    spinner: { width: 40, height: 40, border: "3px solid #1a1a1a", borderTopColor: "#ab0013", borderRadius: "50%", animation: "spin 1s linear infinite" },
    errorContent: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16 },
    errorText: { color: "#888", fontSize: 15, margin: 0 },
    retryBtn: { padding: "10px 24px", background: "#ab0013", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
    hero: { position: "relative" as const, minHeight: "60vh", display: "flex", alignItems: "flex-end", paddingBottom: 50, paddingTop: "clamp(130px, 15vw, 130px)" },
    heroBg: { position: "absolute" as const, inset: 0, overflow: "hidden" },
    heroBgImg: { width: "100%", height: "100%", objectFit: "cover" as const, opacity: 0.35, filter: "blur(3px)" },
    heroGradient: { position: "absolute" as const, inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 60%, #000 100%)" },
    heroGrain: { position: "absolute" as const, inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` },
    heroContent: { position: "relative" as const, zIndex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 clamp(20px, 5vw, 40px)", display: "flex", justifyContent: "center" },
    heroLeft: { maxWidth: 700, textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center" },
    avatarWrapper: { width: "clamp(70px, 18vw, 90px)", height: "clamp(70px, 18vw, 90px)", borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,255,255,0.2)", marginBottom: 16 },
    heroAvatar: { width: "100%", height: "100%", objectFit: "cover" as const },
    nameRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
    heroName: { fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 },
    verifiedBadge: { display: "flex" },
    heroTagline: { fontSize: "clamp(14px, 3.5vw, 16px)", color: "rgba(255,255,255,0.7)", margin: "0 0 20px", lineHeight: 1.5, maxWidth: 520, textAlign: "center" as const },
    heroStats: { display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" as const, gap: 4, marginBottom: 16, fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 16px" },
    statItem: { display: "inline-flex", alignItems: "center", gap: 6 },
    statIcon: { display: "inline-flex", color: "#ab0013", verticalAlign: "middle" },
    statDivider: { color: "rgba(255,255,255,0.4)", margin: "0 8px" },
    socialLinks: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 },
    socialLink: { display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" },
    heroCtas: { display: "flex", alignItems: "center", gap: 16 },
    primaryCta: { display: "inline-block", padding: "14px 28px", background: "#ab0013", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", borderRadius: 8, transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", position: "relative" as const, zIndex: 10 },
    tabsWrap: { position: "sticky" as const, top: 0, zIndex: 50, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    tabsRow: { maxWidth: 1400, margin: "0 auto", padding: "clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 40px)", display: "flex", justifyContent: "center", gap: "clamp(16px, 4vw, 24px)", alignItems: "center" },
    tabBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "clamp(13px, 3.5vw, 15px)", fontWeight: 600, cursor: "pointer", padding: "clamp(6px, 1.5vw, 8px) clamp(2px, 0.5vw, 4px)", borderBottom: "2px solid transparent", transition: "color 0.2s, border-color 0.2s" },
    tabBtnActive: { color: "#fff", borderBottom: "2px solid #ab0013" },
    featuredSection: { background: "#000", padding: "clamp(20px, 4vw, 36px) 0" },
    featuredContainer: { maxWidth: 1400, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)" },
    featuredVideoCard: { display: "block", textDecoration: "none", color: "inherit" },
    featuredVideoThumb: { position: "relative" as const, aspectRatio: "16/9", borderRadius: "clamp(10px, 2.5vw, 16px)", overflow: "hidden", background: "#111", maxWidth: "100%" },
    featuredVideoImg: { width: "100%", height: "100%", objectFit: "cover" as const },
    featuredVideoOverlaySimple: { position: "absolute" as const, inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" as const },
    playCircle: { width: "clamp(44px, 10vw, 58px)", height: "clamp(44px, 10vw, 58px)", borderRadius: "50%", background: "rgba(171,0,19,0.9)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", boxShadow: "0 8px 32px rgba(171,0,19,0.4)" },
    lockBadgeLarge: { position: "absolute" as const, top: "clamp(10px, 2.5vw, 16px)", right: "clamp(10px, 2.5vw, 16px)", width: "clamp(28px, 6vw, 36px)", height: "clamp(28px, 6vw, 36px)", borderRadius: "50%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
    durationBadgeLarge: { position: "absolute" as const, top: "clamp(10px, 2.5vw, 16px)", left: "clamp(10px, 2.5vw, 16px)", padding: "clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)", background: "rgba(0,0,0,0.85)", borderRadius: "clamp(4px, 1vw, 6px)", fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: 600 },
    featuredInfoBelow: { padding: "clamp(12px, 3vw, 16px) 0 0" },
    featuredTitleBelow: { fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 600, margin: "0 0 6px", lineHeight: 1.3, color: "#fff" },
    featuredDescBelow: { fontSize: "clamp(13px, 3vw, 15px)", color: "rgba(255,255,255,0.6)", margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
    featuredLocation: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 16, width: "fit-content" },
    section: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px)" },
    sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { fontSize: "clamp(18px, 4.5vw, 22px)", fontWeight: 600, margin: "0 0 clamp(12px, 3vw, 18px)", color: "#fff", letterSpacing: "-0.01em" },
    tagsRow: { display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 16, marginBottom: 24 },
    tagChip: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" as const },
    tagChipActive: { background: "#ab0013", borderColor: "#ab0013", color: "#fff" },
    emptyState: { color: "#666", fontSize: 15, padding: "40px 0", textAlign: "center" as const },
    latestGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 },
    latestCard: { textDecoration: "none", color: "inherit" },
    latestRail: { display: "flex", gap: 12, overflowX: "auto" as const, paddingBottom: 8, scrollbarWidth: "none" as const, msOverflowStyle: "none" as const, scrollSnapType: "x mandatory" as const, paddingInline: 0 },
    latestCardRail: { width: "clamp(170px, 45vw, 260px)", minWidth: 170, maxWidth: 260, flexShrink: 0, textDecoration: "none", color: "inherit", scrollSnapAlign: "start" as const },
    latestThumb: { position: "relative" as const, aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", background: "#111" },
    latestImg: { width: "100%", height: "100%", objectFit: "cover" as const },
    lockBadge: { position: "absolute" as const, top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
    durationBadge: { position: "absolute" as const, bottom: 8, right: 8, padding: "3px 7px", background: "rgba(0,0,0,0.85)", borderRadius: 4, fontSize: 11, fontWeight: 500 },
    locationTag: { position: "absolute" as const, bottom: 8, left: 8, padding: "3px 8px", background: "rgba(0,0,0,0.75)", borderRadius: 4, fontSize: 10, color: "#ccc", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
    latestTitle: { fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 500, margin: "clamp(6px, 1.5vw, 10px) 0 0", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
    viewAllRow: { marginTop: 20, textAlign: "center" as const },
    viewAllLink: { display: "inline-flex", alignItems: "center", gap: 6, color: "#888", fontSize: 13, textDecoration: "none", fontWeight: 500, background: "none", border: "none", cursor: "pointer" },
    shortsRail: { display: "flex", gap: 12, overflowX: "auto" as const, paddingBottom: 8, scrollbarWidth: "none" as const, msOverflowStyle: "none" as const, scrollSnapType: "x mandatory" as const, paddingInline: 0 },
    shortCard: { flexShrink: 0, width: "clamp(120px, 32vw, 160px)", height: "clamp(214px, 50vw, 249px)", borderRadius: 10, overflow: "hidden", position: "relative" as const, background: "#1a1a1a", scrollSnapAlign: "start" as const },
    shortsGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 },
    shortCardGrid: { aspectRatio: "9/16", borderRadius: 10, overflow: "hidden", position: "relative" as const, display: "block", background: "#1a1a1a", minHeight: 200 },
    shortImg: { width: "100%", height: "100%", objectFit: "cover" as const, position: "absolute" as const, top: 0, left: 0 },
    shortOverlay: { position: "absolute" as const, inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)" },
    lockBadgeShort: { position: "absolute" as const, top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
    globeSection: { maxWidth: 1400, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px)" },
    globeContainer: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: "clamp(20px, 4vw, 32px)" },
    globeContent: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", textAlign: "center" as const },
    globeText: { fontSize: "clamp(14px, 3.5vw, 16px)", color: "rgba(255,255,255,0.6)", margin: "12px 0 20px", lineHeight: 1.6 },
    globeCta: { display: "inline-block", padding: "clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 24px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", fontSize: "clamp(13px, 3vw, 14px)", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" },
    globePreviewStatic: { position: "relative" as const, width: "clamp(280px, 50vw, 380px)", height: "clamp(280px, 50vw, 380px)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
    globeGlow: { display: "none" },
    globeAtmosphere: { display: "none" },
    globe: { position: "relative" as const, width: "clamp(220px, 40vw, 300px)", height: "clamp(220px, 40vw, 300px)", borderRadius: "50%", background: "url('https://upload.wikimedia.org/wikipedia/commons/e/e7/Equirectangular_projection_SW.jpg')", backgroundSize: "630px auto", backgroundPosition: "0 0", boxShadow: "inset -8px -8px 18px rgba(0, 0, 0, 0.4), inset 6px 6px 16px rgba(171, 0, 19, 0.3), 0 0 40px rgba(171, 0, 19, 0.35), 0 0 80px rgba(171, 0, 19, 0.15)", animation: "rotateGlobe 20s linear infinite", filter: "brightness(1.15) saturate(1.1) contrast(1.1)", overflow: "hidden" },
    globeMap: { position: "absolute" as const, inset: 0, borderRadius: "50%", background: "url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW_Map_Lines.png')", backgroundSize: "630px auto", backgroundPosition: "0 0", mixBlendMode: "normal", opacity: 1, filter: "brightness(1.25) contrast(1.2)", animation: "rotateGlobe 20s linear infinite", pointerEvents: "none" as const },
    globeMask: { position: "absolute" as const, width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", pointerEvents: "none" as const },
    globeDots: { position: "absolute" as const, width: 1260, height: 240, top: 0, left: 0, animation: "rotateDots 20s linear infinite", pointerEvents: "none" as const },
    dot: { position: "absolute" as const, width: 6, height: 6, background: "#e11d48", borderRadius: "50%", boxShadow: "0 0 4px #e11d48, 0 0 8px rgba(225, 29, 72, 0.6), 0 0 12px rgba(171, 0, 19, 0.4)", zIndex: 2, animation: "pulseDot 2s ease-in-out infinite" },
    dotRipple: { position: "absolute" as const, top: "50%", left: "50%", width: "100%", height: "100%", borderRadius: "50%", border: "1px solid rgba(225, 29, 72, 0.6)", transform: "translate(-50%, -50%)", animation: "dotRipple 2s ease-out infinite" },
    subscribeCta: { background: "linear-gradient(180deg, #000 0%, #0a0a0a 100%)", padding: "clamp(32px, 7vw, 56px) clamp(20px, 5vw, 40px)", textAlign: "center" as const },
    subscribeContent: { maxWidth: 600, margin: "0 auto" },
    subscribeTitle: { fontSize: "clamp(18px, 4.5vw, 22px)", fontWeight: 600, margin: "0 0 clamp(8px, 2vw, 12px)", letterSpacing: "-0.01em", lineHeight: 1.3 },
    subscribeSubtext: { fontSize: "clamp(13px, 3.5vw, 15px)", color: "#666", margin: "0 0 clamp(20px, 5vw, 28px)" },
    subscribeBtn: { display: "inline-block", padding: "clamp(12px, 3vw, 16px) clamp(28px, 7vw, 40px)", background: "#ab0013", color: "#fff", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 600, textDecoration: "none", borderRadius: "clamp(8px, 2vw, 10px)", transition: "transform 0.2s, box-shadow 0.2s" },
}
