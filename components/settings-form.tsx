"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useVideo } from "@/context/video-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SettingsFormData {
  saveHistory: boolean
  trendingTopic: string
  userTopics: string[]
  viewMode: "trending" | "topics"
}

export default function SettingsForm() {
  const { toast } = useToast()
  const { settings, updateSettings } = useVideo()
  const [newTopic, setNewTopic] = useState<string>("") 
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { control, handleSubmit, setValue, watch } = useForm<SettingsFormData>({
    defaultValues: {
      saveHistory: settings?.saveHistory ?? true,
      trendingTopic: settings?.trendingTopic ?? "US",
      userTopics: settings?.userTopics ?? [],
      viewMode: settings?.viewMode ?? "trending"
    }
  })
  
  // Watch all form fields for changes
  const saveHistory = watch("saveHistory")
  const trendingTopic = watch("trendingTopic")
  const userTopics = watch("userTopics") ?? []
  const viewMode = watch("viewMode")

  // Auto-save when form values change
  useEffect(() => {
    // Skip initial render
    if (!lastSaved) {
      setLastSaved(new Date())
      return
    }

    // Debounce saving to avoid too many updates
    const timer = setTimeout(() => {
      updateSettings({
        ...settings,
        saveHistory,
        trendingTopic,
        userTopics,
        viewMode
      })

      // Show subtle toast notification
      toast({
        title: "Settings saved",
        description: "Your preferences have been automatically saved.",
        duration: 2000 // shorter duration for auto-save notifications
      })

      setLastSaved(new Date())
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [saveHistory, trendingTopic, userTopics, viewMode])

  // Add a new topic
  const addTopic = () => {
    if (!newTopic.trim()) return
    
    // Check if topic already exists
    if (userTopics.includes(newTopic.trim())) {
      toast({
        title: "Topic already exists",
        description: "This topic is already in your list.",
        variant: "destructive"
      })
      return
    }
    
    const updatedTopics = [...userTopics, newTopic.trim()]
    setValue("userTopics", updatedTopics)
    setNewTopic("") // Clear input field
  }

  // Remove a topic
  const removeTopic = (topicToRemove: string) => {
    const updatedTopics = userTopics.filter(topic => topic !== topicToRemove)
    setValue("userTopics", updatedTopics)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Trending Region</Label>
          <p className="text-sm text-muted-foreground">Select region to customize your trending feed</p>
          <Controller
            name="trendingTopic"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="KR">South Korea</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Your Topics</Label>
          <p className="text-sm text-muted-foreground">Add topics to customize your feed</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              placeholder="Enter a topic"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="button" onClick={addTopic} className="text-white">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {userTopics.map((topic) => (
              <div key={topic} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                <span>{topic}</span>
                <button
                  onClick={() => removeTopic(topic)}
                  className="text-secondary-foreground/50 hover:text-secondary-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Save History</Label>
          <p className="text-sm text-muted-foreground">Keep track of watched videos</p>
        </div>
        <Controller
          name="saveHistory"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">Settings are saved automatically</p>
    </div>
  )
}
