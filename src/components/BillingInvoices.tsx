
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, FileText, Printer, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice, InvoiceItem } from "@/types/hospital";
import { useInvoices } from "@/hooks/useInvoices";
import { usePatientNames } from "@/hooks/usePatientNames";
import InvoiceItemsEditor from "@/components/InvoiceItemsEditor";
import { format } from "date-fns";
import { useMemo } from "react";

// Define the allowed statuses for Invoice status field
type InvoiceStatus = "Pending" | "Paid" | "Overdue" | "Cancelled";

interface BillingInvoicesProps {
  userRole: "admin" | "doctor" | "staff";
}

const defaultItem: InvoiceItem = {
  description: "",
  category: "Consultation",
  quantity: 1,
  unitPrice: 0,
  total: 0,
};

const BillingInvoices = ({ userRole }: BillingInvoicesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const { toast } = useToast();

  const { invoices, isLoading, error, updateInvoice, addInvoice, refetch } = useInvoices();
  const { data: patients, isLoading: patientsLoading } = usePatientNames();

  // Create invoice form state
  const [patientId, setPatientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [items, setItems] = useState<InvoiceItem[]>([{ ...defaultItem }]);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<"Pending" | "Paid" | "Overdue" | "Cancelled">("Pending");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState<string>("");

  // Function to generate auto invoice number
  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999) + 1;
    const paddedRandom = random.toString().padStart(3, '0');
    return `INV-${currentYear}-${paddedRandom}`;
  };

  // Helper function to get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient?.fullName || patientId;
  };

  // Calculated values for create form
  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + Number(item.total ?? 0), 0)
  , [items]);

  const total = useMemo(() =>
    Math.max(subtotal + Number(tax) - Number(discount), 0)
  , [subtotal, tax, discount]);

  const resetCreateForm = () => {
    setPatientId("");
    setInvoiceNumber(generateInvoiceNumber());
    setIssueDate(format(new Date(), "yyyy-MM-dd"));
    setDueDate(format(new Date(), "yyyy-MM-dd"));
    setItems([{ ...defaultItem }]);
    setTax(0);
    setDiscount(0);
    setStatus("Pending");
    setPaymentMethod("");
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
  };

  const populateEditForm = (invoice: Invoice) => {
    setPatientId(invoice.patientId);
    setInvoiceNumber(invoice.invoiceNumber);
    setIssueDate(format(invoice.issueDate, "yyyy-MM-dd"));
    setDueDate(format(invoice.dueDate, "yyyy-MM-dd"));
    setItems(invoice.items || [{ ...defaultItem }]);
    setTax(invoice.tax);
    setDiscount(invoice.discount);
    setStatus(invoice.status);
    setPaymentMethod(invoice.paymentMethod || "");
    setPaymentDate(invoice.paymentDate ? format(invoice.paymentDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
    setNotes(invoice.notes || "");
  };

  const handleCreateInvoice = () => {
    setShowCreateForm(true);
    setShowEditForm(false);
    resetCreateForm();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowEditForm(true);
    setShowCreateForm(false);
    populateEditForm(invoice);
  };

  const handleSubmitCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !invoiceNumber || !issueDate || !dueDate || items.length === 0) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    try {
      await addInvoice.mutateAsync({
        patientId,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        items,
        subtotal,
        tax,
        discount,
        total,
        status,
        paymentMethod: paymentMethod || undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        notes,
      });
      toast({
        title: "Invoice created!",
        description: `Invoice ${invoiceNumber} has been saved successfully.`,
      });
      setShowCreateForm(false);
      resetCreateForm();
    } catch (err: any) {
      toast({ title: "Failed to create invoice", description: err?.message, variant: "destructive" });
    }
  };

  const handleSubmitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !patientId || !invoiceNumber || !issueDate || !dueDate || items.length === 0) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    try {
      await updateInvoice.mutateAsync({
        ...selectedInvoice,
        patientId,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        items,
        subtotal,
        tax,
        discount,
        total,
        status,
        paymentMethod: paymentMethod || undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        notes,
      });
      toast({
        title: "Invoice updated!",
        description: `Invoice ${invoiceNumber} has been updated successfully.`,
      });
      setShowEditForm(false);
      setSelectedInvoice(null);
      resetCreateForm();
    } catch (err: any) {
      toast({ title: "Failed to update invoice", description: err.message || "Failed to update invoice", variant: "destructive" });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank", "width=800,height=1040");
    if (!printWindow) return;

    const patientName = getPatientName(invoice.patientId);

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice - ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              background: #f8f9fa; 
              padding: 20px; 
              color: #333;
            }
            .invoice-container { 
              background: white; 
              max-width: 800px; 
              margin: 0 auto; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              border-radius: 12px;
              overflow: hidden;
            }
            .header-section {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              position: relative;
              overflow: hidden;
            }
            .header-section::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .hospital-name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            .hospital-details {
              font-size: 14px;
              line-height: 1.5;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            .invoice-title {
              position: absolute;
              top: 30px;
              right: 30px;
              text-align: right;
              z-index: 1;
            }
            .invoice-title h2 {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .invoice-number {
              font-size: 14px;
              opacity: 0.9;
            }
            .content-section {
              padding: 30px;
            }
            .billing-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 30px;
            }
            .company-info, .billing-to {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #667eea;
              margin-bottom: 10px;
            }
            .info-line {
              margin-bottom: 5px;
              font-size: 14px;
              line-height: 1.4;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              font-size: 14px;
            }
            .items-table th {
              background: #667eea;
              color: white;
              padding: 15px 10px;
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.5px;
            }
            .items-table td {
              padding: 12px 10px;
              border-bottom: 1px solid #eee;
            }
            .items-table tr:hover {
              background: #f8f9fa;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary-section {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .summary-row.total {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              border-top: 2px solid #667eea;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              margin-top: 10px;
            }
            .status-pending { background: #e3f2fd; color: #1976d2; }
            .status-paid { background: #e8f5e8; color: #2e7d2e; }
            .status-overdue { background: #ffebee; color: #c62828; }
            .status-cancelled { background: #f5f5f5; color: #616161; }
            @media print { 
              body { background: white; padding: 0; }
              .invoice-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header-section">
              <div class="hospital-name">Vision Multispeciality Hospital</div>
              <div class="hospital-details">
                Moshi-Chikhali Near RKH Blessings<br>
                Moshi, Pune - 412105<br>
                Phone: 9766660572 / 9146383404
              </div>
              <div class="invoice-title">
                <h2>INVOICE</h2>
                <div class="invoice-number">NUMBER: ${invoice.invoiceNumber}</div>
                <div class="invoice-number">Date: ${new Date(invoice.issueDate).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="content-section">
              <div class="billing-info">
                <div class="company-info">
                  <div class="section-title">Company:</div>
                  <div class="info-line">Vision Multispeciality Hospital</div>
                  <div class="info-line">Moshi-Chikhali Near RKH Blessings</div>
                  <div class="info-line">Moshi, Pune - 412105</div>
                </div>
                <div class="billing-to">
                  <div class="section-title">Billing to:</div>
                  <div class="info-line"><strong>${patientName}</strong></div>
                  <div class="info-line">Invoice Date: ${new Date(invoice.issueDate).toLocaleDateString()}</div>
                  <div class="info-line">Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</div>
                  ${invoice.paymentMethod ? `<div class="info-line">Payment Method: ${invoice.paymentMethod}</div>` : ''}
                </div>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items?.map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td>${item.category}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-right">₹${item.unitPrice.toFixed(2)}</td>
                      <td class="text-right">₹${item.total.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="summary-section">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>₹${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Tax</span>
                  <span>₹${invoice.tax.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Discount</span>
                  <span>-₹${invoice.discount.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>₹${invoice.total.toFixed(2)}</span>
                </div>
              </div>

              <div style="margin-top: 20px;">
                <strong>Status:</strong>
                <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
              </div>

              ${invoice.notes ? `
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                  <div class="section-title">Terms and Conditions:</div>
                  <div style="font-size: 14px; line-height: 1.6; color: #666;">
                    ${invoice.notes}
                  </div>
                </div>
              ` : `
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                  <div class="section-title">Terms and Conditions:</div>
                  <div style="font-size: 14px; line-height: 1.6; color: #666;">
                    Payment is due within 30 days of invoice date. Late payments may incur additional charges. 
                    For any queries regarding this invoice, please contact our billing department.
                  </div>
                </div>
              `}

              <div class="footer-section">
                <div style="margin-bottom: 10px; font-size: 16px; color: #667eea; font-weight: 600;">
                  Thank you for choosing Vision Multispeciality Hospital
                </div>
                <div>For support, contact us at 9766660572 or 9146383404</div>
              </div>
            </div>
          </div>
          
          <script>
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredInvoices = (invoices ?? []).filter(invoice => {
    const patientName = getPatientName(invoice.patientId);
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase());
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

  if (showCreateForm || showEditForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => {
              setShowCreateForm(false);
              setShowEditForm(false);
              setSelectedInvoice(null);
              resetCreateForm();
            }} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {showEditForm ? "Edit Invoice" : "Create New Invoice"}
            </h1>
            <p className="text-muted-foreground">
              {showEditForm ? "Update the invoice details" : "Fill in the details to create a new invoice"}
            </p>
          </div>
        </div>

        <Card className="max-w-4xl">
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={showEditForm ? handleSubmitEditForm : handleSubmitCreateForm}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <Select
                    value={patientId}
                    onValueChange={setPatientId}
                    disabled={patientsLoading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={patientsLoading ? "Loading..." : "Select a patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map(pt => (
                        <SelectItem key={pt.id} value={pt.id}>{pt.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    required
                    readOnly={!showEditForm}
                    className={!showEditForm ? "bg-gray-50" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Invoice Items *</Label>
                <InvoiceItemsEditor items={items} setItems={setItems} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div>
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input id="subtotal" value={subtotal} disabled readOnly />
                </div>
                <div>
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    min={0}
                    value={tax}
                    onChange={e => setTax(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="total">Total</Label>
                  <Input id="total" value={total} disabled readOnly />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={v => setStatus(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any notes (optional)..."
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {showEditForm ? "Update Invoice" : "Create Invoice"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setSelectedInvoice(null);
                    resetCreateForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage patient invoices and billing records</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Button 
            onClick={handleCreateInvoice} 
            className="justify-start h-12"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Invoice
          </Button>
        )}
      </div>

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
                <div><b>Patient Name:</b> {getPatientName(selectedInvoice.patientId)}</div>
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
                  placeholder="Search by invoice number or patient name..."
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
                <TableHead>Patient Name</TableHead>
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
                  <TableCell>{getPatientName(invoice.patientId)}</TableCell>
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
