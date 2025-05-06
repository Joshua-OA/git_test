"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Download } from "lucide-react"

export default function DeploymentStrategy() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Limited Deployment Strategy</h1>
        <p className="text-muted-foreground">A phased approach to safely deploy the Luxe Clinic EHR system</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Limited Deployment Overview</CardTitle>
          <CardDescription>
            This document outlines our strategy for a controlled, limited deployment before full production rollout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">What is Limited Deployment?</h3>
              <p className="text-muted-foreground mt-1">
                Limited deployment is a controlled release of the EHR system to a small subset of users and patients
                before full production rollout. This approach allows us to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Identify and fix issues in a controlled environment</li>
                <li>Gather feedback from real users</li>
                <li>Refine workflows and processes</li>
                <li>Ensure data integrity and security</li>
                <li>Train staff in a real but limited environment</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Deployment Phases</h3>
              <div className="mt-4 space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Phase 1: Internal Testing (Current)</h4>
                    <p className="text-muted-foreground mt-1">
                      System administrators and IT staff test core functionality with test data
                    </p>
                    <div className="flex items-center mt-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>Completed</span>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Phase 2: Limited Staff Deployment</h4>
                    <p className="text-muted-foreground mt-1">
                      Selected staff members (2-3 from each department) use the system with test patients
                    </p>
                    <div className="flex items-center mt-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>In Progress</span>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Phase 3: Limited Patient Deployment</h4>
                    <p className="text-muted-foreground mt-1">
                      Introduce real patient data for a small subset (20-50) of patients
                    </p>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span>Scheduled to start in 2 weeks</span>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    4
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Phase 4: Department Rollout</h4>
                    <p className="text-muted-foreground mt-1">
                      Roll out to one department at a time, starting with General Practice
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    5
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Phase 5: Full Production</h4>
                    <p className="text-muted-foreground mt-1">Complete rollout to all staff and patients</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Success Criteria for Limited Deployment</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Zero critical bugs or data integrity issues for 14 consecutive days</li>
                <li>95% or higher system uptime</li>
                <li>Successful completion of all core workflows without errors</li>
                <li>Positive feedback from at least 80% of test users</li>
                <li>All security and compliance requirements met</li>
                <li>Backup and recovery procedures successfully tested</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Feedback Collection</h3>
              <p className="text-muted-foreground mt-1">During limited deployment, we will collect feedback through:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>In-app feedback forms</li>
                <li>Weekly user interviews</li>
                <li>System usage analytics</li>
                <li>Error and performance monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Strategy Document
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Deployment Status</CardTitle>
          <CardDescription>Phase 2: Limited Staff Deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">Active Test Users</h3>
              <p className="text-muted-foreground mt-1">8 staff members currently testing the system</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>2 Doctors</li>
                <li>3 Nurses</li>
                <li>1 Pharmacist</li>
                <li>1 Lab Technician</li>
                <li>1 Administrator</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-medium">Test Patient Records</h3>
              <p className="text-muted-foreground mt-1">25 test patient records created for testing purposes</p>
            </div>

            <div>
              <h3 className="text-base font-medium">Next Steps</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>Complete staff training for remaining test users</li>
                <li>Resolve outstanding issues from Phase 2 feedback</li>
                <li>Prepare for Phase 3 (Limited Patient Deployment)</li>
                <li>Conduct security audit before introducing real patient data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
