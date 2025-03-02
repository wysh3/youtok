"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface SettingsFormData {
  darkMode: boolean
  notifications: boolean
}

export default function SettingsForm() {
  const { toast } = useToast()
  const { control, handleSubmit, setValue } = useForm<SettingsFormData>({
    defaultValues: {
      darkMode: false,
      notifications: true
    }
  })

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('youtok-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setValue('darkMode', settings.darkMode)
      setValue('notifications', settings.notifications)
      
      // Apply dark mode if it was enabled
      if (settings.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const onSubmit = (data: SettingsFormData) => {
    // Save settings to localStorage
    localStorage.setItem('youtok-settings', JSON.stringify(data))
    
    // Apply dark mode setting
    if (data.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

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
          <Label>Dark Mode</Label>
          <p className="text-sm text-muted-foreground">Toggle dark theme</p>
        </div>
        <Controller
          name="darkMode"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notifications</Label>
          <p className="text-sm text-muted-foreground">Enable push notifications</p>
        </div>
        <Controller
          name="notifications"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  )
}
