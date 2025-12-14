"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTTSStore } from "@/store/use-tts-store"
import { Brain, Mic } from "lucide-react"

interface ModelSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModelSelector({ open, onOpenChange }: ModelSelectorProps) {
  const aiModel = useTTSStore((state) => state.aiModel)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Model Configuration</DialogTitle>
          <DialogDescription>
            View the current AI models being used for emotion detection and speech synthesis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-sm">Emotion Detection Model</h3>
                <p className="text-sm text-muted-foreground">{aiModel.emotionModel}</p>
                <p className="text-xs text-muted-foreground">
                  BERT-based model fine-tuned on the GoEmotions dataset for detecting emotional context in text
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Mic className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-sm">Speech Synthesis Model</h3>
                <p className="text-sm text-muted-foreground">{aiModel.speechModel}</p>
                <p className="text-xs text-muted-foreground">
                  Neural TTS system with emotion-driven prosodic control for expressive speech generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
