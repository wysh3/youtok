"use client"

import { useEffect } from "react"
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
}

export default function SettingsForm() {
  const { toast } = useToast()
  const { settings, updateSettings } = useVideo()
  const { control, handleSubmit, setValue } = useForm<SettingsFormData>({
    defaultValues: {
      saveHistory: settings.saveHistory,
      trendingTopic: settings.trendingTopic
    }
  })

  const onSubmit = (data: SettingsFormData) => {
    // Update settings through context
    updateSettings({
      ...settings,
      saveHistory: data.saveHistory,
      trendingTopic: data.trendingTopic
    })

    // Show success toast
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved."
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
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

      <Button type="submit" className="w-full text-white">
        Save Settings
      </Button>
    </form>
  )
}
