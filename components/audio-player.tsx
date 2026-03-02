"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Download, Star, X, CheckCircle2, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/use-auth-store"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api-fetch"

interface AudioPlayerProps {
  audioUrl: string
  requestId?: string
}

function StarRating({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  max?: number
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }).map((_, i) => {
          const starVal = i + 1
          const filled = hovered ? starVal <= hovered : starVal <= value
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(starVal)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(starVal)}
              className="rounded-md p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-600"
                )}
              />
            </button>
          )
        })}
        <span className="ml-2 text-sm text-slate-400">
          {(hovered || value) ? `${hovered || value}/${max}` : "—"}
        </span>
      </div>
    </div>
  )
}

export function AudioPlayer({ audioUrl, requestId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Rating dialog state
  const [showRating, setShowRating] = useState(false)
  const [mos, setMos] = useState(0)
  const [intelligibility, setIntelligibility] = useState(0)
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle")

  const { user } = useAuthStore()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const replay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play()
    setIsPlaying(true)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSubmitRating = async () => {
    if (!mos || !intelligibility || !requestId || !user?.accessToken) return
    setSubmitState("loading")
    try {
      const res = await apiFetch(`/api/tts/feedback/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mos_score: mos,
          intelligibility: intelligibility,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setSubmitState("success")
      setTimeout(() => {
        setShowRating(false)
        setSubmitState("idle")
      }, 1800)
    } catch {
      setSubmitState("error")
      setTimeout(() => setSubmitState("idle"), 2000)
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const canRate = !!user && !!requestId

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 relative">
      <audio ref={audioRef} src={audioUrl} />

      <div className="space-y-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={togglePlay} size="sm" className="gap-2">
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play
            </>
          )}
        </Button>

        <Button onClick={replay} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" asChild>
          <a href={audioUrl} download="speech.wav">
            <Download className="h-4 w-4" />
          </a>
        </Button>

        {canRate && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 ml-auto text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
            onClick={() => { setShowRating(true); setSubmitState("idle"); setMos(0); setIntelligibility(0) }}
          >
            <Star className="h-3.5 w-3.5" />
            Rate this voice
          </Button>
        )}
      </div>

      {/* Rating Dialog Overlay */}
      {showRating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-sm space-y-6 rounded-xl border border-white/10 bg-slate-950/60 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Rate this voice</h4>
              <button
                onClick={() => setShowRating(false)}
                className="rounded-md p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitState === "success" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
                <p className="text-sm font-medium">Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <StarRating label="MOS Score (1–5)" value={mos} onChange={setMos} />
                <StarRating label="Intelligibility (1–5)" value={intelligibility} onChange={setIntelligibility} />

                {submitState === "error" && (
                  <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
                )}

                <Button
                  className="w-full"
                  disabled={!mos || !intelligibility || submitState === "loading"}
                  onClick={handleSubmitRating}
                >
                  {submitState === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Submit Rating
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
