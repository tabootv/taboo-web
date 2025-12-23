// ============================================
// Framer Code Component - All Creators Page
// Netflix-style grid of all TabooTV creators
// Uses PUBLIC API - No authentication required!
// ============================================

import { useState, useEffect } from "react"

// Uncomment these when pasting into Framer:
// import { addPropertyControls, ControlType } from "framer"

const API_URL = "https://app.taboo.tv/api/public"

// ============================================
// API FUNCTIONS
// ============================================
interface Creator {
    id: number
    name: string
    description: string | null
    handler: string | null
    dp: string
    country: string | null
    total_videos: number
    total_shorts: number
    countries_recorded: number
    x: string | null
    tiktok: string | null
    instagram: string | null
    facebook: string | null
    youtube: string | null
}

interface ApiResponse {
    success?: boolean
    message?: string
    data?: {
        creators: Creator[]
        pagination?: {
            total: number
            per_page: number
            current_page: number
            last_page: number
        }
    }
    creators?: Creator[]
}

async function getAllCreators(): Promise<Creator[]> {
    const response = await fetch(`${API_URL}/creators`, {
        headers: { Accept: "application/json" },
    })
    const data: ApiResponse = await response.json()
    return data?.data?.creators || data?.creators || []
}

// ============================================
// ICONS
// ============================================
const Icons = {
    verified: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ab0013">
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
    videoIcon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
        </svg>
    ),
    shortsIcon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
        </svg>
    ),
    globeIcon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    ),
    arrowRight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    ),
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AllCreators({
    title = "Our Creators",
    subtitle = "Meet the fearless storytellers bringing you raw, unfiltered content from around the world"
}) {
    const [creators, setCreators] = useState<Creator[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchData = () => {
        setLoading(true)
        setError(false)
        getAllCreators()
            .then((data) => {
                setCreators(data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
                setError(true)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Filter out specific creators (e.g., Nick Shirley id=11)
    const hiddenCreatorIds = [11]
    const visibleCreators = creators.filter((c) => !hiddenCreatorIds.includes(c.id))

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

    if (error) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.errorContent}>
                    <p style={styles.errorText}>Failed to load creators</p>
                    <button onClick={fetchData} style={styles.retryBtn} className="retry-hover">
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.page}>
            <style>{`
                html { scroll-behavior: smooth; }
                .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .card-hover:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(171, 0, 19, 0.25); }
                .btn-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
                .btn-hover:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(171, 0, 19, 0.35); }
                .retry-hover:hover { background: #c41420 !important; transform: scale(1.05); }
                .avatar-glow { transition: box-shadow 0.3s ease; }
                .card-hover:hover .avatar-glow { box-shadow: 0 0 30px rgba(171, 0, 19, 0.5); }
                @media (max-width: 1200px) { .creators-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                @media (max-width: 900px) { .creators-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 600px) { .creators-grid { grid-template-columns: 1fr !important; } }
            `}</style>

            {/* HERO SECTION */}
            <section style={styles.hero}>
                <div style={styles.heroGradient} />
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>{title}</h1>
                    <p style={styles.heroSubtitle}>{subtitle}</p>
                </div>
            </section>

            {/* CREATORS GRID */}
            <section style={styles.section}>
                {visibleCreators.length === 0 ? (
                    <p style={styles.emptyState}>No creators found.</p>
                ) : (
                    <div style={styles.creatorsGrid} className="creators-grid">
                        {visibleCreators.map((creator) => {
                            const stats = [
                                { key: "videos", value: creator.total_videos, icon: Icons.videoIcon },
                                { key: "shorts", value: creator.total_shorts, icon: Icons.shortsIcon },
                                { key: "countries", value: creator.countries_recorded, icon: Icons.globeIcon },
                            ].filter((s) => s.value > 0)

                            // Build profile URL using handler (slug) or fall back to id
                            const profileSlug = creator.handler || creator.id

                            return (
                                <div key={creator.id} style={styles.creatorCard} className="card-hover">
                                    {/* Card Background Gradient */}
                                    <div style={styles.cardBg} />

                                    {/* Avatar */}
                                    <div style={styles.avatarSection}>
                                        <div style={styles.avatarWrapper} className="avatar-glow">
                                            <img src={creator.dp} alt={creator.name} style={styles.avatar} />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={styles.cardInfo}>
                                        <div style={styles.nameRow}>
                                            <h3 style={styles.creatorName}>{creator.name}</h3>
                                            <span style={styles.verifiedBadge}>{Icons.verified}</span>
                                        </div>

                                        {creator.description && (
                                            <p style={styles.description}>
                                                {creator.description.length > 80
                                                    ? creator.description.slice(0, 80) + "..."
                                                    : creator.description}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        {stats.length > 0 && (
                                            <div style={styles.statsRow}>
                                                {stats.map((stat) => (
                                                    <div key={stat.key} style={styles.statItem}>
                                                        <span style={styles.statIcon}>{stat.icon}</span>
                                                        <span style={styles.statValue}>{stat.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* View Profile Button */}
                                        <a
                                            href={`https://taboo.tv/${profileSlug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={styles.viewProfileBtn}
                                            className="btn-hover"
                                        >
                                            View Profile {Icons.arrowRight}
                                        </a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* CTA SECTION */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Ready to explore?</h2>
                    <p style={styles.ctaSubtext}>Subscribe to TabooTV for unlimited access to all creator content.</p>
                    <a
                        href="https://taboo.tv/choose-plan"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.ctaBtn}
                        className="btn-hover"
                    >
                        Start Watching
                    </a>
                </div>
            </section>
        </div>
    )
}

// ============================================
// PROPERTY CONTROLS (for Framer)
// ============================================
// Uncomment when using in Framer:
/*
addPropertyControls(AllCreators, {
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "Our Creators",
    },
    subtitle: {
        type: ControlType.String,
        title: "Subtitle",
        defaultValue: "Meet the fearless storytellers bringing you raw, unfiltered content from around the world",
    },
})
*/

// ============================================
// STYLES
// ============================================
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    loadingContainer: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#666",
        fontSize: 14
    },
    spinner: {
        width: 40,
        height: 40,
        border: "3px solid #1a1a1a",
        borderTopColor: "#ab0013",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },
    errorContent: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 16
    },
    errorText: {
        color: "#888",
        fontSize: 15,
        margin: 0
    },
    retryBtn: {
        padding: "10px 24px",
        background: "#ab0013",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s"
    },

    // Hero
    hero: {
        position: "relative" as const,
        padding: "clamp(100px, 20vw, 160px) clamp(20px, 5vw, 40px) clamp(60px, 12vw, 100px)",
        textAlign: "center" as const,
        overflow: "hidden",
    },
    heroGradient: {
        position: "absolute" as const,
        inset: 0,
        background: "radial-gradient(ellipse at center top, rgba(171, 0, 19, 0.15) 0%, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)",
    },
    heroContent: {
        position: "relative" as const,
        zIndex: 1,
        maxWidth: 800,
        margin: "0 auto"
    },
    heroTitle: {
        fontSize: "clamp(32px, 8vw, 56px)",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        margin: "0 0 16px",
        background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    heroSubtitle: {
        fontSize: "clamp(14px, 3.5vw, 18px)",
        color: "rgba(255,255,255,0.6)",
        margin: 0,
        lineHeight: 1.6,
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
    },

    // Section
    section: {
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 clamp(16px, 4vw, 40px) clamp(40px, 8vw, 80px)"
    },
    emptyState: {
        color: "#666",
        fontSize: 15,
        padding: "40px 0",
        textAlign: "center" as const
    },

    // Creators Grid
    creatorsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "clamp(16px, 3vw, 24px)",
    },

    // Creator Card
    creatorCard: {
        position: "relative" as const,
        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column" as const,
    },
    cardBg: {
        position: "absolute" as const,
        inset: 0,
        background: "radial-gradient(ellipse at center top, rgba(171, 0, 19, 0.1) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease",
        pointerEvents: "none" as const,
    },
    avatarSection: {
        padding: "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 24px) 0",
        display: "flex",
        justifyContent: "center",
    },
    avatarWrapper: {
        width: "clamp(80px, 20vw, 100px)",
        height: "clamp(80px, 20vw, 100px)",
        borderRadius: "50%",
        overflow: "hidden",
        border: "3px solid rgba(255,255,255,0.15)",
        background: "#111",
    },
    avatar: {
        width: "100%",
        height: "100%",
        objectFit: "cover" as const
    },
    cardInfo: {
        padding: "clamp(16px, 3vw, 20px) clamp(20px, 4vw, 24px) clamp(20px, 4vw, 28px)",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        textAlign: "center" as const,
        flex: 1,
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    creatorName: {
        fontSize: "clamp(16px, 4vw, 20px)",
        fontWeight: 600,
        margin: 0,
        color: "#fff",
    },
    verifiedBadge: {
        display: "flex",
        flexShrink: 0,
    },
    description: {
        fontSize: 13,
        color: "rgba(255,255,255,0.6)",
        margin: "0 0 12px",
        lineHeight: 1.5,
        minHeight: 40,
    },
    statsRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginBottom: 12,
    },
    statItem: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
    },
    statIcon: {
        display: "flex",
        color: "#ab0013",
    },
    statValue: {
        fontWeight: 500,
    },
    viewProfileBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "rgba(171, 0, 19, 0.15)",
        border: "1px solid rgba(171, 0, 19, 0.3)",
        borderRadius: 8,
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        marginTop: "auto",
        cursor: "pointer",
        position: "relative" as const,
        zIndex: 10,
    },

    // CTA Section
    ctaSection: {
        background: "linear-gradient(180deg, #000 0%, #0a0a0a 100%)",
        padding: "clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px)",
        textAlign: "center" as const
    },
    ctaContent: {
        maxWidth: 600,
        margin: "0 auto"
    },
    ctaTitle: {
        fontSize: "clamp(20px, 5vw, 28px)",
        fontWeight: 600,
        margin: "0 0 12px",
        letterSpacing: "-0.01em"
    },
    ctaSubtext: {
        fontSize: "clamp(13px, 3.5vw, 15px)",
        color: "#666",
        margin: "0 0 24px"
    },
    ctaBtn: {
        display: "inline-block",
        padding: "14px 32px",
        background: "#ab0013",
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: 8,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        position: "relative" as const,
        zIndex: 10,
    },
}
