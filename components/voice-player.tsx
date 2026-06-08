"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, StopCircle, Volume2 } from "lucide-react"

interface VoicePlayerProps {
  text: string
  articleTitle: string
}

export function VoicePlayer({ text, articleTitle }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<number>(0)
  const [speed, setSpeed] = useState(1)
  const [pitch, setPitch] = useState(1)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textWordsRef = useRef<string[]>([])

  // Initialize voices
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && selectedVoice >= availableVoices.length) {
        setSelectedVoice(0)
      }
    }

    updateVoices()
    window.speechSynthesis.onvoiceschanged = updateVoices

    // Split text into words for progress tracking
    const cleanText = text.replace(/<[^>]*>/g, "")
    textWordsRef.current = cleanText.split(/\s+/).filter((word) => word.length > 0)

    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [text, selectedVoice])

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const handlePlay = () => {
    if (isPlaying) {
      // Pause
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      // Resume or start
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        setIsPlaying(true)
      } else {
        // Start new
        const utterance = new SpeechSynthesisUtterance(stripHtml(text))
        utterance.rate = speed
        utterance.pitch = pitch
        utterance.volume = 1

        if (voices.length > 0 && selectedVoice < voices.length) {
          utterance.voice = voices[selectedVoice]
        }

        // Track progress
        let currentWord = 0
        utterance.onboundary = (event) => {
          if (event.name === "word") {
            currentWord++
            setCurrentWordIndex(currentWord)
          }
        }

        utterance.onstart = () => {
          setIsSpeaking(true)
        }

        utterance.onend = () => {
          setIsPlaying(false)
          setIsSpeaking(false)
          setCurrentWordIndex(0)
        }

        utterance.onerror = () => {
          setIsPlaying(false)
          setIsSpeaking(false)
        }

        speechRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
      }
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsSpeaking(false)
    setCurrentWordIndex(0)
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      handlePlay()
    }
  }

  const progressPercentage = textWordsRef.current.length > 0 
    ? (currentWordIndex / textWordsRef.current.length) * 100 
    : 0

  return (
    <div className="theme-card p-4 mb-6 rounded-lg border theme-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-5 h-5 theme-text" />
          <span className="font-serif font-semibold theme-text">Listen to Article</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 theme-border overflow-hidden">
          <div
            className="bg-theme-button-primary h-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: "var(--theme-button-primary)",
            }}
          ></div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handlePlay}
            size="sm"
            className="font-serif theme-button-primary"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
            className="font-serif theme-button-secondary"
            title="Stop"
          >
            <StopCircle className="w-4 h-4" />
          </Button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="speed" className="text-sm theme-text font-serif">
              Speed:
            </label>
            <select
              id="speed"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="theme-input px-2 py-1 text-sm rounded font-serif"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="voice" className="text-sm theme-text font-serif">
                Voice:
              </label>
              <select
                id="voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(parseInt(e.target.value))}
                className="theme-input px-2 py-1 text-sm rounded font-serif max-w-xs"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-xs theme-text-secondary font-serif">
          {isSpeaking ? (
            <span>Speaking... {Math.round(progressPercentage)}% complete</span>
          ) : isPlaying ? (
            <span>Paused at {Math.round(progressPercentage)}%</span>
          ) : (
            <span>Ready to play</span>
          )}
        </div>
      </div>
    </div>
  )
}
