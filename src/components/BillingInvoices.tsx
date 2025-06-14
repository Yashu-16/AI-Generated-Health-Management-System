import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, FileText, Printer } from "lucide-react"; // Only import used icons
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/types/hospital";
import { useInvoices } from "@/hooks/useInvoices";

// Define the allowed statuses for Invoice status field
type InvoiceStatus = "Pending" | "Paid" | "Overdue" | "Cancelled";

interface BillingInvoicesProps {
  userRole: "admin" | "doctor" | "staff";
}

const BillingInvoices = ({ userRole }: BillingInvoicesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { toast } = useToast();

  const { invoices, isLoading, error, addInvoice, updateInvoice, refetch } = useInvoices();

  // Ensures status is always type-safe
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, "id" | "createdAt" | "updatedAt">>({
    patientId: "",
    invoiceNumber: "",
    issueDate: new Date(),
    dueDate: new Date(),
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    status: "Pending",
    paymentMethod: undefined,
    paymentDate: undefined,
    notes: "",
  });

  const handleAddInvoice = async () => {
    // Basic validation
    if (!newInvoice.patientId || !newInvoice.invoiceNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Make sure status is explicitly one of the allowed values (should always be by type)
      await addInvoice.mutateAsync({
        ...newInvoice,
        status: newInvoice.status as InvoiceStatus,
        issueDate: newInvoice.issueDate,
        dueDate: newInvoice.dueDate,
      });
      toast({
        title: "Invoice Added Successfully",
        description: `Invoice ${newInvoice.invoiceNumber} has been created`,
      });
      setShowAddDialog(false);
    } catch (err: any) {
      toast({
        title: "Error adding invoice",
        description: err.message || "Failed to add invoice",
        variant: "destructive"
      });
    }
  };

  const handleEditInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowEditDialog(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await updateInvoice.mutateAsync(selectedInvoice);
      toast({
        title: "Invoice Updated",
        description: `Invoice ${selectedInvoice.invoiceNumber} has been updated successfully`,
      });
      setShowEditDialog(false);
      setSelectedInvoice(null);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update invoice",
        variant: "destructive"
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Professional hospital invoice draft styling with header and details
    const printWindow = window.open("", "_blank", "width=800,height=1040");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f7f7f7; }
            .invoice-box { background: #fff; padding: 40px 32px; max-width: 750px; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 16px rgba(36,37,38,0.11); }
            .header { display: flex; flex-direction: row; align-items: flex-start; justify-content: space-between; }
            .logo { font-weight: bold; font-size: 2rem; color: #222; letter-spacing: 2px; }
            .hospital-details { margin-top: 8px; letter-spacing: 0.5px; color: #333; font-size: 1rem; }
            .mt-1 { margin-top: 8px; }
            .hr { border: none; border-top: 1px solid #ececec; margin: 16px 0; }
            .details { margin-bottom: 18px; font-size: 1rem; color: #1a1a1a; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 2rem; }
            .label { font-weight: 500; margin-right: 0.5rem; color: #666; }
            .value { font-weight: 500; color: #191919; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 22px; font-size: 1rem; }
            .items-table th, .items-table td { border: 1px solid #eee; padding: 8px 10px; text-align: left; }
            .items-table th { background: #f1f5fb; color: #39548a; font-weight: 700; }
            .items-table tr:last-child td { border-bottom: 2px solid #ccc; }
            .summary-table { margin-top: 16px; width: 60%; float: right; border-collapse: collapse; }
            .summary-table td { padding: 7px 12px; }
            .summary-label { text-align: right; color: #666; }
            .summary-value { font-weight: 600; }
            .summary-table tr:last-child td { font-size: 1.15em; color: #16417e; font-weight: bold; border-top: 1px solid #ddd; }
            .status-badge { display: inline-block; padding: 4px 14px; font-size: 0.99em; border-radius: 99px; margin-top: 8px; }
            .status-pending { background: #e0edfa; color: #185ea6; }
            .status-paid { background: #e2fced; color: #09817c; }
            .status-overdue { background: #fde2e1; color: #a94442; }
            .status-cancelled { background: #f0f0f0; color: #636363; }
            .notes-box { background: #fafbfc; border: 1px solid #e7edf3; padding: 13px 16px; border-radius: 5px; margin-top: 22px; color: #2d3948; }
            @media print { body { background: #fff; } .invoice-box { box-shadow: none !important; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">MetroHealth Hospital</div>
                <div class="hospital-details">
                  123 Main Street, Delhi - 110011 <br/>
                  Phone: +91 9876543210 <br/>
                  Email: info@metrohealthhospital.com
                </div>
              </div>
              <div style="text-align:right">
                <span style="font-size:1.2rem;font-weight:bold;color:#185ea6;">INVOICE</span>
                <div class="mt-1">#${invoice.invoiceNumber}</div>
              </div>
            </div>
            <div class="hr"></div>
            <div class="grid details">
              <div>
                <span class="label">Patient ID:</span> <span class="value">${invoice.patientId}</span>
              </div>
              <div>
                <span class="label">Issue Date:</span> <span class="value">${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ""}</span>
              </div>
              <div>
                <span class="label">Due Date:</span> <span class="value">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ""}</span>
              </div>
              <div>
                <span class="label">Payment Method:</span> <span class="value">${invoice.paymentMethod || "-"}</span>
              </div>
              <div>
                <span class="label">Payment Date:</span> <span class="value">${invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : "-"}</span>
              </div>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items?.map(
                  (item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.category ?? ""}</td>
                    <td style="text-align:center;">${item.quantity}</td>
                    <td style="text-align:right;">₹${item.unitPrice}</td>
                    <td style="text-align:right;">₹${item.total}</td>
                  </tr>
                `
                ).join("")}
              </tbody>
            </table>
            <table class="summary-table">
              <tr>
                <td class="summary-label">Subtotal</td>
                <td class="summary-value">₹${invoice.subtotal}</td>
              </tr>
              <tr>
                <td class="summary-label">Tax</td>
                <td class="summary-value">₹${invoice.tax}</td>
              </tr>
              <tr>
                <td class="summary-label">Discount</td>
                <td class="summary-value">₹${invoice.discount}</td>
              </tr>
              <tr>
                <td class="summary-label">Total</td>
                <td class="summary-value">₹${invoice.total}</td>
              </tr>
            </table>
            <div style="clear: both;"></div>
            <div class="hr"></div>
            <div>
              <span class="label">Status:</span>
              <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
            </div>
            ${
              invoice.notes
                ? `<div class="notes-box"><b>Notes:</b> ${invoice.notes}</div>`
                : ""
            }
            <div style="margin-top:30px;font-size:1.1rem;color:#344665;">
              Thank you for choosing MetroHealth Hospital.
            </div>
          </div>
          <script>
            setTimeout(function() {
              window.print();
              window.close();
            }, 400);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredInvoices = (invoices ?? []).filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patientId?.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-blue-100 text-blue-800";
      case "Paid": return "bg-green-100 text-green-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "Cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage patient invoices and billing records</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Fill in the invoice information below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      value={newInvoice.patientId}
                      onChange={(e) => setNewInvoice({...newInvoice, patientId: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={newInvoice.invoiceNumber}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newInvoice.issueDate.toISOString().slice(0, 10)}
                      onChange={(e) => setNewInvoice({...newInvoice, issueDate: new Date(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newInvoice.dueDate.toISOString().slice(0, 10)}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: new Date(e.target.value)})}
                    />
                  </div>
                </div>
                <Button onClick={handleAddInvoice} className="w-full">
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Update invoice details</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={selectedInvoice.patientId}
                    onChange={(e) => setSelectedInvoice({...selectedInvoice, patientId: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={selectedInvoice.invoiceNumber}
                    onChange={(e) => setSelectedInvoice({...selectedInvoice, invoiceNumber: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={selectedInvoice.issueDate.toISOString().slice(0, 10)}
                    onChange={(e) => setSelectedInvoice({...selectedInvoice, issueDate: new Date(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={selectedInvoice.dueDate.toISOString().slice(0, 10)}
                    onChange={(e) => setSelectedInvoice({...selectedInvoice, dueDate: new Date(e.target.value)})}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateInvoice} className="w-full">
                Update Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>Full invoice information shown below</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div>
              <div className="mb-2 flex flex-col gap-1">
                <div><b>Invoice Number:</b> {selectedInvoice.invoiceNumber}</div>
                <div><b>Patient ID:</b> {selectedInvoice.patientId}</div>
                <div><b>Issue Date:</b> {selectedInvoice.issueDate.toLocaleDateString()}</div>
                <div><b>Due Date:</b> {selectedInvoice.dueDate.toLocaleDateString()}</div>
              </div>
              <table className="w-full border mt-3">
                <thead>
                  <tr>
                    <th className="border p-2">Description</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Unit Price</th>
                    <th className="border p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{item.description}</td>
                      <td className="border p-2">{item.category}</td>
                      <td className="border p-2 text-center">{item.quantity}</td>
                      <td className="border p-2 text-right">₹{item.unitPrice}</td>
                      <td className="border p-2 text-right">₹{item.total}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className="border p-2 text-right font-bold">Subtotal</td>
                    <td className="border p-2 text-right">₹{selectedInvoice.subtotal}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border p-2 text-right font-bold">Tax</td>
                    <td className="border p-2 text-right">₹{selectedInvoice.tax}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border p-2 text-right font-bold">Discount</td>
                    <td className="border p-2 text-right">₹{selectedInvoice.discount}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border p-2 text-right font-bold">Total</td>
                    <td className="border p-2 text-right">₹{selectedInvoice.total}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                {selectedInvoice.paymentMethod && <span><b>Payment Method:</b> {selectedInvoice.paymentMethod}</span>}
                {selectedInvoice.paymentDate && (
                  <span><b>Payment Date:</b> {selectedInvoice.paymentDate.toLocaleDateString()}</span>
                )}
              </div>
              {selectedInvoice.notes && (
                <div className="mt-2">
                  <b>Notes:</b> {selectedInvoice.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Search and manage patient invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={statusFilter === "" ? "All" : statusFilter}
              onValueChange={v => setStatusFilter(v || "All")}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.patientId}</TableCell>
                  <TableCell>{invoice.issueDate.toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.dueDate.toLocaleDateString()}</TableCell>
                  <TableCell>₹{invoice.total}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 flex">
                    <Button
                      variant="outline"
                      size="sm"
                      title="View Invoice"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Edit Invoice"
                      onClick={() => handleEditInvoice(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Print Invoice"
                      onClick={() => handlePrintInvoice(invoice)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingInvoices;
