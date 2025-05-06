"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, RefreshCw, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

// This would be a server action in a real implementation
async function updateDeploymentSettings(settings: any) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

export default function DeploymentPage() {
  const [loading, setLoading] = useState(false)
  const [deploymentMode, setDeploymentMode] = useState("limited")
  const [maxUsers, setMaxUsers] = useState("20")
  const [maxPatients, setMaxPatients] = useState("50")
  const [feedbackEnabled, setFeedbackEnabled] = useState(true)
  const [feedbackEmail, setFeedbackEmail] = useState("feedback@luxeclinic.com")
  const [inviteEmails, setInviteEmails] = useState("")
  const [deploymentProgress, setDeploymentProgress] = useState(25) // Percentage of deployment complete

  async function handleSaveSettings() {
    setLoading(true)
    try {
      const result = await updateDeploymentSettings({
        deploymentMode,
        maxUsers,
        maxPatients,
        feedbackEnabled,
        feedbackEmail,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Deployment settings updated successfully",
        })
      }
    } catch (error) {
      console.error("Error saving deployment settings:", error)
      toast({
        title: "Error",
        description: "Failed to update deployment settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSendInvites() {
    setLoading(true)
    try {
      // This would send invites to the specified emails
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Invitations sent successfully",
      })

      setInviteEmails("")
    } catch (error) {
      console.error("Error sending invites:", error)
      toast({
        title: "Error",
        description: "Failed to send invitations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Deployment Management</h1>
        <p className="text-muted-foreground">Configure limited deployment settings</p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Limited Deployment Mode</AlertTitle>
        <AlertDescription>
          Your system is currently in limited deployment mode. This allows you to test with a small group of users
          before full deployment.
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Deployment Progress</h2>
        <Progress value={deploymentProgress} className="h-2 mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Limited Deployment</span>
          <span>Full Production</span>
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Deployment Settings</TabsTrigger>
          <TabsTrigger value="invites">User Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Limited Deployment Configuration</CardTitle>
              <CardDescription>Control how your system is deployed to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Limited Deployment Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict system access to a limited set of users and patients
                    </p>
                  </div>
                  <Switch
                    checked={deploymentMode === "limited"}
                    onCheckedChange={(checked) => setDeploymentMode(checked ? "limited" : "full")}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-users">Maximum Users</Label>
                    <Input
                      id="max-users"
                      type="number"
                      value={maxUsers}
                      onChange={(e) => setMaxUsers(e.target.value)}
                      disabled={deploymentMode !== "limited"}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum number of staff users allowed during limited deployment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-patients">Maximum Patients</Label>
                    <Input
                      id="max-patients"
                      type="number"
                      value={maxPatients}
                      onChange={(e) => setMaxPatients(e.target.value)}
                      disabled={deploymentMode !== "limited"}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum number of patients allowed during limited deployment
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Feedback Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect feedback from users during limited deployment
                      </p>
                    </div>
                    <Switch checked={feedbackEnabled} onCheckedChange={setFeedbackEnabled} />
                  </div>

                  {feedbackEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="feedback-email">Feedback Email</Label>
                      <Input
                        id="feedback-email"
                        type="email"
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">Email address where user feedback will be sent</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <CardTitle>Invite Users</CardTitle>
              <CardDescription>Invite staff members to join the limited deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-emails">Email Addresses</Label>
                  <Textarea
                    id="invite-emails"
                    placeholder="Enter email addresses, one per line"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground">Enter one email address per line</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendInvites} disabled={loading || !inviteEmails.trim()}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Send Invitations
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
