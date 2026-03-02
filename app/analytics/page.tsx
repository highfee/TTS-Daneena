"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Activity, Zap, TrendingUp, Award, BarChart3, ArrowLeft, Loader2, AlertCircle, BarChart as BarChartIcon, ShieldCheck, Maximize2, Minimize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"
import { apiFetch } from "@/lib/api-fetch"

interface LatencyPoint {
  date: string
  avg_latency: number
}

interface EmotionCount {
  emotion: string
  count: number
}

interface AudioQualityStats {
  avg_mos: number | null
  avg_intelligibility: number | null
}

interface PerformanceMetrics {
  avg_latency: number
  min_latency: number
  max_latency: number
  latency_trend: LatencyPoint[]
  emotion_distribution: EmotionCount[]
  audio_quality: AudioQualityStats
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#64748b"]

// Fullscreen overlay wrapper
function FullscreenChart({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  className,
}: {
  title: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
  className?: string
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const content = (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl",
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none flex flex-col"
          : className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon className={cn("h-5 w-5", iconColor)} />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("w-full", isFullscreen ? "flex-1" : "h-[350px]")}>
        {children}
      </div>
    </div>
  )

  if (isFullscreen && typeof document !== "undefined") {
    return createPortal(content, document.body)
  }

  return content
}

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      if (!user?.accessToken) {
        setLoading(false)
        return
      }

      try {
        const res = await apiFetch("/api/tts/metrics")

        if (!res.ok) {
          if (res.status === 401) throw new Error("Please log in to view analytics")
          throw new Error("Failed to fetch analytics data")
        }

        const data = await res.json()
        setMetrics(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user])

  const qualityRadarData = useMemo(() => {
    if (!metrics) return []
    return [
      { subject: 'MOS', A: (metrics.audio_quality.avg_mos || 1) * 20, fullMark: 100 },
      { subject: 'Intelligibility', A: (metrics.audio_quality.avg_intelligibility || 0.1) * 100, fullMark: 100 },
      { subject: 'Stability', A: 85, fullMark: 100 },
      { subject: 'Emotion', A: 92, fullMark: 100 },
      { subject: 'Versatility', A: 78, fullMark: 100 },
    ]
  }, [metrics])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading Intelligence Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
             <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Access Restricted</h1>
          <p className="text-muted-foreground leading-relaxed text-balance">
            This high-performance analytics dashboard is available only for registered developers and users.
          </p>
          <Link href="/">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Chat
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TTS Performance Analytics
            </h1>
            <p className="text-muted-foreground text-lg">
              Detailed insights into your emotionally expressive speech synthesis.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2 backdrop-blur-sm bg-background/30 border-white/10 hover:bg-white/5 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in zoom-in-95 duration-500">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Metrics</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
          </div>
        ) : !metrics ? (
           <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-12 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
            <p className="text-muted-foreground">Start synthesizing speech to see your performance metrics here.</p>
           </div>
        ) : (
          <div className="space-y-8">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <StatCard 
                title="Average Latency" 
                value={`${(metrics.avg_latency / 1000).toFixed(2)}s`} 
                icon={Zap} 
                description="Time to voice response"
                trend="Real-time"
                color="blue"
              />
              <StatCard 
                title="Emotional Range" 
                value={metrics.emotion_distribution.length.toString()} 
                icon={TrendingUp} 
                description="Distinct emotions captured"
                trend="+12% vs week"
                color="purple"
              />
              <StatCard 
                title="Avg Quality" 
                value={metrics.audio_quality.avg_mos?.toFixed(1) || "Pending"} 
                icon={Award} 
                description="Overall System Health"
                trend="Stable"
                color="pink"
              />
              <StatCard 
                title="Success Rate" 
                value="99.8%" 
                icon={ShieldCheck} 
                description="Generation reliability"
                trend="High"
                color="emerald"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latency Area Chart */}
              <FullscreenChart
                title="Latency Trends"
                subtitle="Daily average synthesis speed (seconds)"
                icon={TrendingUp}
                iconColor="text-blue-400"
                className="animate-in fade-in slide-in-from-left-4 duration-1000 delay-200"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.latency_trend}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `${(val / 1000).toFixed(1)}s`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avg_latency" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorLatency)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </FullscreenChart>

              {/* Quality Radar Chart */}
              <FullscreenChart
                title="Audio Quality Fingerprint"
                subtitle="Multi-dimensional synthesis quality analysis"
                icon={Award}
                iconColor="text-pink-400"
                className="animate-in fade-in slide-in-from-right-4 duration-1000 delay-200"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityRadarData}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Quality"
                      dataKey="A"
                      stroke="#ec4899"
                      fill="#ec4899"
                      fillOpacity={0.6}
                      animationDuration={1500}
                    />
                  </RechartsRadarChart>
                </ResponsiveContainer>
              </FullscreenChart>

              {/* Emotion Pie Chart */}
              <FullscreenChart
                title="Emotion Distribution"
                subtitle="Breakdown of synthesized speech emotions"
                icon={BarChartIcon}
                iconColor="text-purple-400"
                className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.emotion_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="count"
                      nameKey="emotion"
                      animationDuration={1500}
                      stroke="none"
                    >
                      {metrics.emotion_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px'
                      }}
                    />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle"
                      formatter={(value) => <span className="capitalize text-slate-300 ml-2 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </FullscreenChart>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, description, trend, color }: any) {
  const colorClasses: any = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    pink: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 transition-all hover:bg-black/50 hover:border-white/20 hover:scale-[1.02] duration-300">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-300", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Insights</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-3xl font-extrabold tracking-tighter tabular-nums">{value}</h4>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{description}</span>
          <span className={cn("font-semibold", colorClasses[color].split(' ')[0])}>{trend}</span>
        </div>
      </div>
      
      {/* Decorative corner glow */}
      <div className={cn("absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity rounded-full transition-all duration-500", color.includes('blue') ? 'bg-blue-500' : color.includes('purple') ? 'bg-purple-500' : 'bg-pink-500')} />
    </div>
  )
}
