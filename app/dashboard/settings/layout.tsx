import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Settings - Luxe Clinic",
  description: "Manage system settings",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your system settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="w-full border-b pb-0">
          <TabsTrigger value="general" asChild>
            <Link href="/dashboard/settings">General</Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <Link href="/dashboard/settings/users">Users</Link>
          </TabsTrigger>
          <TabsTrigger value="backups" asChild>
            <Link href="/dashboard/settings/backups">Backups</Link>
          </TabsTrigger>
          <TabsTrigger value="deployment" asChild>
            <Link href="/dashboard/settings/deployment">Deployment</Link>
          </TabsTrigger>
          <TabsTrigger value="security" asChild>
            <Link href="/dashboard/settings/security">Security</Link>
          </TabsTrigger>
          <TabsTrigger value="integrations" asChild>
            <Link href="/dashboard/settings/integrations">Integrations</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="*" className="border-none p-0">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  )
}
