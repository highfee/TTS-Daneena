import type { EmotionType } from "@/store/use-tts-store"
import { cn } from "@/lib/utils"
import { Smile, Frown, Minus, Flame, ShieldAlert, Zap } from "lucide-react"

interface EmotionBadgeProps {
  emotion: EmotionType
  confidence: number
}

const emotionConfig = {
  happy: {
    label: "Happy",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    icon: Smile,
  },
  sad: {
    label: "Sad",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: Frown,
  },
  neutral: {
    label: "Neutral",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    icon: Minus,
  },
  angry: {
    label: "Angry",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: Flame,
  },
  fear: {
    label: "Fear",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    icon: ShieldAlert,
  },
  surprise: {
    label: "Surprise",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: Zap,
  },
}

export function EmotionBadge({ emotion, confidence }: EmotionBadgeProps) {
  const config = emotionConfig[emotion]
  const Icon = config.icon

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5",
          config.bgColor,
          config.borderColor,
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence</span>
          <span className="font-medium">{Math.round(confidence * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all duration-500", config.color.replace("text-", "bg-"))}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
