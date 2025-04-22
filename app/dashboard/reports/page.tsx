"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, Download, DollarSign, Users, Activity, Calendar, BarChart, PieChart, LineChart } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

export default function ReportsPage() {
  const supabase = createClientComponentClient();
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 5, 1),
    to: new Date(2023, 5, 30),
  });
  const [financialData, setFinancialData] = useState<any>(null);
  const [clinicalData, setClinicalData] = useState<any>(null);
  const [operationalData, setOperationalData] = useState<any>(null);

  useEffect(() => {
    async function fetchReports() {
      const { data: financial } = await supabase.from("financial_reports").select("*");
      const { data: clinical } = await supabase.from("clinical_reports").select("*");
      const { data: operational } = await supabase.from("operational_reports").select("*");

      setFinancialData(financial?.[0]);
      setClinicalData(clinical?.[0]);
      setOperationalData(operational?.[0]);
    }

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and view reports for your practice</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange className="w-[300px]" />
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{financialData?.total_revenue?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-gray-500">+{financialData?.growth_percent || 0}% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{financialData?.outstanding_payments?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-gray-500">{financialData?.pending_invoices || 0} invoices pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{financialData?.average_transaction?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-gray-500">+5% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clinicalData?.total_patients || 0}</div>
                <p className="text-xs text-gray-500">+{clinicalData?.new_patients_this_month || 0} this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Diagnoses</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clinicalData?.diagnoses || 0}</div>
                <p className="text-xs text-gray-500">Across {clinicalData?.condition_count || 0} conditions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clinicalData?.prescriptions || 0}</div>
                <p className="text-xs text-gray-500">For {clinicalData?.unique_patients || 0} patients</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationalData?.appointments || 0}</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationalData?.no_shows || 0}</div>
                <p className="text-xs text-gray-500">{operationalData?.no_show_percent || 0}% of appointments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationalData?.avg_wait_time || "N/A"} min</div>
                <p className="text-xs text-gray-500">Compared to last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
