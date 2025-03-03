"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useVideo } from "@/context/video-context"

interface SettingsFormData {
  saveHistory: boolean
}

export default function SettingsForm() {
  const { toast } = useToast()
  const { settings, updateSettings } = useVideo()
  const { control, handleSubmit, setValue } = useForm<SettingsFormData>({
    defaultValues: {
      saveHistory: settings.saveHistory
    }
  })

  const onSubmit = (data: SettingsFormData) => {
    // Update settings through context
    updateSettings({
      ...settings,
      saveHistory: data.saveHistory
    })

    // Show success toast
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved."
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">


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
