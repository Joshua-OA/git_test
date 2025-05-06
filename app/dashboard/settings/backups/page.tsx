"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBackup, getBackups, restoreBackup, scheduleBackup, applyBackupRetention } from "@/app/actions/backup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, Download, RefreshCw, Upload, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function BackupsPage() {
  const router = useRouter()
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const [time, setTime] = useState("00:00")
  const [schedulingBackup, setSchedulingBackup] = useState(false)
  const [applyingRetention, setApplyingRetention] = useState(false)

  // Retention policy settings
  const [retentionPolicy, setRetentionPolicy] = useState({
    daily: 7,
    weekly: 4,
    monthly: 12,
    yearly: 7,
  })

  // Fetch backups on page load
  useEffect(() => {
    fetchBackups()
  }, [])

  async function fetchBackups() {
    setLoading(true)
    try {
      const result = await getBackups()
      if (result.success) {
        // Sort backups by creation date (newest first)
        const sortedBackups = result.backups.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setBackups(sortedBackups)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch backups",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching backups:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching backups",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateBackup() {
    setLoading(true)
    try {
      const result = await createBackup()
      if (result.success) {
        toast({
          title: "Success",
          description: `Backup created: ${result.filename}`,
        })
        fetchBackups()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating backup",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRestoreBackup() {
    if (!selectedBackup) return

    if (!confirm("Are you sure you want to restore from this backup? This will overwrite current data.")) {
      return
    }

    setRestoring(true)
    try {
      const result = await restoreBackup(selectedBackup)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Backup restored successfully",
        })
        // Refresh the page after successful restoration
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to restore backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while restoring backup",
        variant: "destructive",
      })
    } finally {
      setRestoring(false)
    }
  }

  async function handleScheduleBackup() {
    setSchedulingBackup(true)
    try {
      const result = await scheduleBackup(frequency, time)
      if (result.success) {
        toast({
          title: "Success",
          description: `Backup scheduled: ${frequency} at ${time}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to schedule backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling backup:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while scheduling backup",
        variant: "destructive",
      })
    } finally {
      setSchedulingBackup(false)
    }
  }

  async function handleApplyRetention() {
    if (
      !confirm(
        "Are you sure you want to apply the retention policy? This will delete old backups according to your settings.",
      )
    ) {
      return
    }

    setApplyingRetention(true)
    try {
      const result = await applyBackupRetention(retentionPolicy)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Retention policy applied successfully",
        })
        fetchBackups()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to apply retention policy",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error applying retention policy:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while applying retention policy",
        variant: "destructive",
      })
    } finally {
      setApplyingRetention(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Backups</h1>
        <p className="text-muted-foreground">Manage database backups and restoration</p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Restoring from a backup will overwrite all current data. Make sure to create a new backup before restoring.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="backups">
        <TabsList className="mb-4">
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="retention">Retention Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="backups">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Manual Backup</CardTitle>
                <CardDescription>Create a new backup of the current database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create a complete backup of all data in the database and store it securely.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateBackup} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Create Backup
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restore Backup</CardTitle>
                <CardDescription>Restore the database from a previous backup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-select">Select Backup</Label>
                    <Select
                      value={selectedBackup || ""}
                      onValueChange={setSelectedBackup}
                      disabled={backups.length === 0 || restoring}
                    >
                      <SelectTrigger id="backup-select">
                        <SelectValue placeholder="Select a backup" />
                      </SelectTrigger>
                      <SelectContent>
                        {backups.map((backup) => (
                          <SelectItem key={backup.name} value={backup.name}>
                            {backup.name} ({formatDistanceToNow(new Date(backup.created_at), { addSuffix: true })})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleRestoreBackup} disabled={!selectedBackup || restoring}>
                  {restoring ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Restore Selected Backup
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Available Backups</h2>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading backups...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center p-6 border rounded-lg">
                <p className="text-muted-foreground">No backups available</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left">Filename</th>
                      <th className="px-4 py-2 text-left">Created</th>
                      <th className="px-4 py-2 text-left">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup, index) => (
                      <tr key={backup.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="px-4 py-2">{backup.name}</td>
                        <td className="px-4 py-2">
                          {formatDistanceToNow(new Date(backup.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-2">{(backup.metadata.size / 1024).toFixed(2)} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Automated Backup Schedule</CardTitle>
              <CardDescription>Configure automatic database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Automated Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create backups according to the schedule
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Backup Frequency</Label>
                    <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Backup Time</Label>
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleScheduleBackup} disabled={schedulingBackup}>
                {schedulingBackup ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Schedule
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Backup Retention Policy</CardTitle>
              <CardDescription>Configure how long backups are kept</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Healthcare Data Compliance</AlertTitle>
                  <AlertDescription>
                    For healthcare systems, it's recommended to keep yearly backups for at least 7 years to comply with
                    medical record retention requirements.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily-retention">Daily Backups (days)</Label>
                    <Input
                      id="daily-retention"
                      type="number"
                      min="1"
                      max="30"
                      value={retentionPolicy.daily}
                      onChange={(e) =>
                        setRetentionPolicy({ ...retentionPolicy, daily: Number.parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Keep daily backups for this many days</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weekly-retention">Weekly Backups (weeks)</Label>
                    <Input
                      id="weekly-retention"
                      type="number"
                      min="1"
                      max="52"
                      value={retentionPolicy.weekly}
                      onChange={(e) =>
                        setRetentionPolicy({ ...retentionPolicy, weekly: Number.parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Keep weekly backups for this many weeks</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-retention">Monthly Backups (months)</Label>
                    <Input
                      id="monthly-retention"
                      type="number"
                      min="1"
                      max="36"
                      value={retentionPolicy.monthly}
                      onChange={(e) =>
                        setRetentionPolicy({ ...retentionPolicy, monthly: Number.parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Keep monthly backups for this many months</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearly-retention">Yearly Backups (years)</Label>
                    <Input
                      id="yearly-retention"
                      type="number"
                      min="1"
                      max="20"
                      value={retentionPolicy.yearly}
                      onChange={(e) =>
                        setRetentionPolicy({ ...retentionPolicy, yearly: Number.parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Keep yearly backups for this many years</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={fetchBackups} disabled={loading}>
                Refresh
              </Button>
              <Button onClick={handleApplyRetention} disabled={applyingRetention}>
                {applyingRetention ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Apply Retention Policy
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
