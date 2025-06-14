import React, { useMemo, useState } from "react";
import { format, isSameDay, isSameMonth, isSameYear, getYear, getMonth, startOfDay, parseISO } from "date-fns";
import { useInvoices } from "@/hooks/useInvoices";
import { usePatients } from "@/hooks/usePatients";
import { CalendarDays, List, Table as TableIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type FilterType = "date" | "month" | "year";

interface ReportRow {
  period: string; // date, month, or year string
  totalRevenue: number;
  patientCount: number;
  admitted: number;
  discharged: number;
  critical: number;
}

export default function ReportTab() {
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { patients, isLoading: patientsLoading } = usePatients();

  const [filterType, setFilterType] = useState<FilterType>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(new Date());

  // Filter and aggregate logic
  const tableData: ReportRow[] = useMemo(() => {
    if (!invoices || !patients) return [];

    let grouped: { [key: string]: ReportRow } = {};

    // Helper to create row if doesn't exist
    function getOrInitRow(key: string, periodLabel: string) {
      if (!grouped[key]) {
        grouped[key] = {
          period: periodLabel,
          totalRevenue: 0,
          patientCount: 0,
          admitted: 0,
          discharged: 0,
          critical: 0,
        };
      }
      return grouped[key];
    }

    // GROUPING BASED ON FILTER TYPE
    if (filterType === "date") {
      // For each invoice, group by date
      invoices.forEach(inv => {
        const d = inv.issueDate instanceof Date ? inv.issueDate : parseISO(inv.issueDate as unknown as string);
        const key = format(d, "yyyy-MM-dd");
        const row = getOrInitRow(key, format(d, "PPP"));
        row.totalRevenue += inv.total;
      });
      // For each patient, group by admissionDate
      patients.forEach(p => {
        if (!p.admissionDate) return;
        const d = p.admissionDate instanceof Date ? p.admissionDate : parseISO(p.admissionDate as unknown as string);
        const key = format(d, "yyyy-MM-dd");
        const row = getOrInitRow(key, format(d, "PPP"));
        row.patientCount += 1;
        if (p.status === "Admitted") row.admitted += 1;
        if (p.status === "Discharged") row.discharged += 1;
        if (p.status === "Critical") row.critical += 1;
      });
    } else if (filterType === "month") {
      invoices.forEach(inv => {
        const d = inv.issueDate instanceof Date ? inv.issueDate : parseISO(inv.issueDate as unknown as string);
        const key = format(d, "yyyy-MM");
        const row = getOrInitRow(key, format(d, "LLLL yyyy"));
        row.totalRevenue += inv.total;
      });
      patients.forEach(p => {
        if (!p.admissionDate) return;
        const d = p.admissionDate instanceof Date ? p.admissionDate : parseISO(p.admissionDate as unknown as string);
        const key = format(d, "yyyy-MM");
        const row = getOrInitRow(key, format(d, "LLLL yyyy"));
        row.patientCount += 1;
        if (p.status === "Admitted") row.admitted += 1;
        if (p.status === "Discharged") row.discharged += 1;
        if (p.status === "Critical") row.critical += 1;
      });
    } else if (filterType === "year") {
      invoices.forEach(inv => {
        const d = inv.issueDate instanceof Date ? inv.issueDate : parseISO(inv.issueDate as unknown as string);
        const key = format(d, "yyyy");
        const row = getOrInitRow(key, key);
        row.totalRevenue += inv.total;
      });
      patients.forEach(p => {
        if (!p.admissionDate) return;
        const d = p.admissionDate instanceof Date ? p.admissionDate : parseISO(p.admissionDate as unknown as string);
        const key = format(d, "yyyy");
        const row = getOrInitRow(key, key);
        row.patientCount += 1;
        if (p.status === "Admitted") row.admitted += 1;
        if (p.status === "Discharged") row.discharged += 1;
        if (p.status === "Critical") row.critical += 1;
      });
    }

    // Apply Filter: Only show periods matching picker
    let filteredRows = Object.values(grouped);
    if (filterType === "date" && selectedDate) {
      const key = format(selectedDate, "yyyy-MM-dd");
      filteredRows = filteredRows.filter(r => format(parseISO(r.period), "yyyy-MM-dd") === key || r.period === format(selectedDate, "PPP"));
    }
    if (filterType === "month" && selectedMonth) {
      const key = format(selectedMonth, "yyyy-MM");
      filteredRows = filteredRows.filter(r => format(parseISO(r.period + "-01"), "yyyy-MM") === key || r.period === format(selectedMonth, "LLLL yyyy"));
    }
    if (filterType === "year" && selectedYear) {
      const key = format(selectedYear, "yyyy");
      filteredRows = filteredRows.filter(r => r.period === key);
    }

    // Descending sort (latest on top)
    if (filterType === "date") {
      filteredRows.sort((a, b) =>
        new Date(a.period) < new Date(b.period) ? 1 : -1
      );
    } else if (filterType === "month") {
      filteredRows.sort((a, b) =>
        new Date(a.period + "-01") < new Date(b.period + "-01") ? 1 : -1
      );
    } else if (filterType === "year") {
      filteredRows.sort((a, b) => (a.period < b.period ? 1 : -1));
    }

    return filteredRows;
  }, [invoices, patients, filterType, selectedDate, selectedMonth, selectedYear]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Daily/Monthly/Yearly Reports</h2>
          <p className="text-muted-foreground text-sm max-w-2xl">
            View statistics and revenue for any date, month or year. Filter below for the period you want.
          </p>
        </div>
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <label className="font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Period:
            <select
              className="ml-2 rounded border px-2 py-1 bg-white outline-none"
              value={filterType}
              onChange={e => setFilterType(e.target.value as FilterType)}
            >
              <option value="date">Date</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </label>
          {filterType === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("ml-2", !selectedDate && "text-muted-foreground")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
          {filterType === "month" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("ml-2", !selectedMonth && "text-muted-foreground")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedMonth ? format(selectedMonth, "LLLL yyyy") : "Pick a month"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={setSelectedMonth}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  fromDate={new Date(2000,0,1)}
                  toDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          )}
          {filterType === "year" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("ml-2", !selectedYear && "text-muted-foreground")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedYear ? format(selectedYear, "yyyy") : "Pick a year"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedYear}
                  onSelect={setSelectedYear}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  fromDate={new Date(2000,0,1)}
                  toDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      <div className="rounded-lg overflow-x-auto bg-white p-4 shadow-sm border border-muted">
        {(invoicesLoading || patientsLoading) ? (
          <div className="py-10 text-center text-muted-foreground">Loading report data...</div>
        ) : (
          <Table>
            <TableCaption> {tableData.length === 0 ? "No Data Found" : ""} </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {filterType === "date"
                    ? "Date"
                    : filterType === "month"
                      ? "Month"
                      : "Year"}
                </TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Total Patients</TableHead>
                <TableHead>Admitted</TableHead>
                <TableHead>Discharged</TableHead>
                <TableHead>Critical</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No data found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row, i) => (
                  <TableRow key={row.period + i}>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>₹{row.totalRevenue.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{row.patientCount}</TableCell>
                    <TableCell>{row.admitted}</TableCell>
                    <TableCell>{row.discharged}</TableCell>
                    <TableCell>{row.critical}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
