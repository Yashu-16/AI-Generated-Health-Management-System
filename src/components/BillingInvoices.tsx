import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, IndianRupee, FileText, User, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice, InvoiceItem } from "@/types/hospital";
import { useInvoices } from "@/hooks/useInvoices";
import { usePatientNames } from "@/hooks/usePatientNames";

interface BillingInvoicesProps {
  userRole: "admin" | "doctor" | "staff";
}

const BillingInvoices = ({ userRole }: BillingInvoicesProps) => {
  // INTEGRATE SUPABASE
  const { invoices, isLoading, error, addInvoice, updateInvoice, refetch } = useInvoices();
  const { data: patients, isLoading: patientsLoading, error: patientsError } = usePatientNames();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  // Edit dialog state
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // For add new invoice form
  const [newInvoice, setNewInvoice] = useState({
    patientId: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0, category: "Consultation" as const }],
    discount: 0,
    notes: "",
  });

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = (invoices ? invoices.length + 1 : 1).toString().padStart(3, '0');
    return `INV-${year}-${nextNumber}`;
  };

  const generateUniqueReferenceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `REF${timestamp}${random}`.slice(-10);
  };

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: "", quantity: 1, unitPrice: 0, total: 0, category: "Consultation" as const }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = newInvoice.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  // CREATE INVOICE - Supabase
  const handleCreateInvoice = async () => {
    if (!newInvoice.patientId || newInvoice.items.some(item => !item.description)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax - newInvoice.discount;

    const invoiceObj = {
      patientId: newInvoice.patientId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: newInvoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        category: item.category
      })),
      subtotal,
      tax,
      discount: newInvoice.discount,
      total,
      status: "Pending",
      notes: newInvoice.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await addInvoice.mutateAsync(invoiceObj);
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoiceObj.invoiceNumber} created`
      });
      setNewInvoice({
        patientId: "",
        items: [{ description: "", quantity: 1, unitPrice: 0, total: 0, category: "Consultation" as const }],
        discount: 0,
        notes: ""
      });
      setShowAddDialog(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // EDIT INVOICE - Supabase
  const handleUpdateInvoice = async () => {
    if (!editInvoice) return;
    const subtotal = editInvoice.items.reduce((sum, i) => sum + i.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax - (editInvoice.discount || 0);

    const updatedInvoice = {
      ...editInvoice,
      subtotal,
      tax,
      total,
      updatedAt: new Date(),
    };

    try {
      await updateInvoice.mutateAsync(updatedInvoice);
      setShowEditDialog(false);
      setEditInvoice(null);
      toast({
        title: "Invoice Updated",
        description: `Invoice ${updatedInvoice.invoiceNumber} updated successfully`,
      });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Handle changes in editInvoice dialog
  const handleEditInvoiceChange = (field: keyof Invoice, value: any) => {
    if (!editInvoice) return;
    setEditInvoice((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  // Handle invoice item updates
  const handleEditInvoiceItemChange = (idx: number, field: keyof InvoiceItem, value: any) => {
    if (!editInvoice) return;
    setEditInvoice((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((it, i) =>
        i === idx ? { ...it, [field]: value, total: (field === 'quantity' || field === 'unitPrice') 
          ? ((field === 'quantity' ? value : it.quantity) * (field === 'unitPrice' ? value : it.unitPrice)) : it.total } : it
      );
      return { ...prev, items };
    });
  };

  // Filtered invoices using loaded patients
  const filteredInvoices = (invoices ?? []).filter(invoice => {
    const patient = patients?.find(p => p.id === invoice.patientId);
    const matchesSearch = patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Paid": return "bg-green-100 text-green-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "Cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = (invoices ?? []).filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = (invoices ?? []).filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = (invoices ?? []).filter(inv => inv.status === "Overdue").reduce((sum, inv) => sum + inv.total, 0);

  const printInvoiceWithReference = (invoice: Invoice) => {
    const patient = patients?.find(p => p.id === invoice.patientId);
    const referenceNumber = generateUniqueReferenceNumber();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border: 2px solid #2563eb; padding: 20px; background-color: #eff6ff; }
              .hospital-name { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
              .hospital-info { font-size: 14px; color: #1e40af; line-height: 1.5; }
              .invoice-details { margin: 20px 0; padding: 15px; border: 1px solid #bfdbfe; background-color: #f8fafc; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table th, .items-table td { border: 1px solid #2563eb; padding: 10px; text-align: left; }
              .items-table th { background-color: #dbeafe; font-weight: bold; color: #1e40af; }
              .totals { margin-top: 20px; text-align: right; border: 1px solid #bfdbfe; padding: 15px; }
              .reference-section { margin: 30px 0; text-align: center; border: 2px solid #2563eb; padding: 25px; background-color: #eff6ff; }
              .reference-number { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #1e40af; margin: 15px 0; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="hospital-name">VISION MULTISPECIALITY HOSPITAL</div>
              <div class="hospital-info">
                <strong>Address:</strong> Moshi-Chikhali Near RKH Blessings, Moshi, Pune - 412105<br>
                <strong>Contact:</strong> 📞 9766660572 / 9146383404<br>
                <strong>Email:</strong> info@visionhospital.com
              </div>
            </div>
            
            <div class="invoice-details">
              <h2 style="margin-top: 0; color: #1e40af;">MEDICAL INVOICE</h2>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                  <p><strong>Patient Name:</strong> ${patient?.fullName}</p>
                  <p><strong>Issue Date:</strong> ${invoice.issueDate.toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString('en-IN')}</p>
                  <p><strong>Status:</strong> ${invoice.status}</p>
                </div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price (₹)</th>
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.description}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
                    <td>₹${item.total.toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div style="margin-bottom: 8px;"><strong>Subtotal: ₹${invoice.subtotal.toLocaleString('en-IN')}</strong></div>
              <div style="margin-bottom: 8px;"><strong>Tax (10%): ₹${invoice.tax.toLocaleString('en-IN')}</strong></div>
              <div style="margin-bottom: 8px;"><strong>Discount: -₹${invoice.discount.toLocaleString('en-IN')}</strong></div>
              <div style="font-size: 20px; border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 10px;">
                <strong>TOTAL AMOUNT: ₹${invoice.total.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            
            <div class="reference-section">
              <h3 style="margin-top: 0; color: #1e40af;">REFERENCE NUMBER</h3>
              <div class="reference-number">${referenceNumber}</div>
              <p style="font-size: 12px; margin-bottom: 0;">Please quote this reference number for all communications</p>
            </div>
            
            ${invoice.notes ? `<div style="margin-top: 20px; padding: 15px; border: 1px solid #bfdbfe; background-color: #f8fafc;"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}
            
            <div class="footer">
              <p><strong>Thank you for choosing Vision Multispeciality Hospital</strong></p>
              <p>For any queries, please contact us at the above mentioned contact details</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      console.log(`Invoice ${invoice.invoiceNumber} generated with reference: ${referenceNumber}`);
      
      toast({
        title: "Invoice Printed",
        description: `Invoice with reference ${referenceNumber} has been generated`,
      });
    }
  };

  const updateInvoiceStatus = (invoiceId: string, status: "Paid" | "Overdue" | "Cancelled") => {
    if (!invoices) return;
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const updatedInvoice = {
          ...inv,
          status,
          updatedAt: new Date()
        };
        if (status === "Paid") {
          updatedInvoice.paymentDate = new Date();
          updatedInvoice.paymentMethod = "Credit Card";
        }
        return updatedInvoice;
      }
      return inv;
    });
    // Since invoices is from hook, we cannot directly set it here.
    // Instead, we update via updateInvoice mutation for the changed invoice.
    const updatedInvoice = updatedInvoices.find(inv => inv.id === invoiceId);
    if (updatedInvoice) {
      updateInvoice.mutate(updatedInvoice);
      toast({
        title: "Status Updated",
        description: `Invoice status changed to ${status}`,
      });
      refetch();
    }
  };

  // Function to start editing
  const handleStartEdit = (invoice: Invoice) => {
    setEditInvoice({ ...invoice }); // clone for safety
    setShowEditDialog(true);
  };

  // Show loading states and errors at top
  if (isLoading || patientsLoading) return <div>Loading...</div>;
  if (error) return <div className="text-destructive">Error loading invoices: {error.message}</div>;
  if (patientsError) return <div className="text-destructive">Error loading patients: {patientsError.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage patient billing with unique reference numbers</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate an invoice with unique reference number for patient services</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={newInvoice.patientId}
                    onChange={(e) => setNewInvoice({...newInvoice, patientId: e.target.value})}
                  >
                    <option value="">Select patient</option>
                    {patients?.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Invoice Items</h3>
                    <Button type="button" onClick={handleAddItem} size="sm">
                      Add Item
                    </Button>
                  </div>
                  
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-3 p-3 border rounded">
                      <div className="col-span-4">
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Service or item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Category</Label>
                        <select
                          className="w-full p-2 border rounded text-sm"
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                        >
                          <option value="Consultation">Consultation</option>
                          <option value="Medication">Medication</option>
                          <option value="Lab Test">Lab Test</option>
                          <option value="Room Charge">Room Charge</option>
                          <option value="Procedure">Procedure</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price (₹)</Label>
                        <Input
                          type="number"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Total</Label>
                        <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                          ₹{item.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Label>&nbsp;</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          disabled={newInvoice.items.length === 1}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Discount (₹)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={newInvoice.discount}
                      onChange={(e) => setNewInvoice({...newInvoice, discount: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newInvoice.notes}
                      onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{newInvoice.items.reduce((sum, item) => sum + item.total, 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>₹{(newInvoice.items.reduce((sum, item) => sum + item.total, 0) * 0.1).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{newInvoice.discount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{(newInvoice.items.reduce((sum, item) => sum + item.total, 0) * 1.1 - newInvoice.discount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">Each invoice will be generated with a unique reference number for easy tracking</span>
                </div>

                <Button onClick={handleCreateInvoice} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Invoice with Reference Number
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <User className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{overdueAmount.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">Invoice List</CardTitle>
          <CardDescription>Search and manage patient invoices with reference tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const patient = patients?.find(p => p.id === invoice.patientId);
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{patient?.fullName}</TableCell>
                    <TableCell>{invoice.issueDate.toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{invoice.dueDate.toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>₹{invoice.total.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => printInvoiceWithReference(invoice)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Invoice Details</DialogTitle>
                            <DialogDescription>{invoice.invoiceNumber}</DialogDescription>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">Patient</Label>
                                  <p>{patients?.find(p => p.id === selectedInvoice.patientId)?.fullName}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Status</Label>
                                  <p>
                                    <Badge className={getStatusColor(selectedInvoice.status)}>
                                      {selectedInvoice.status}
                                    </Badge>
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="font-semibold">Items</Label>
                                <div className="mt-2 space-y-2">
                                  {selectedInvoice.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                      <span>{item.description} (x{item.quantity})</span>
                                      <span>₹{item.total.toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>₹{selectedInvoice.tax.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Discount:</span>
                                    <span>-₹{selectedInvoice.discount.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {invoice.status === "Pending" && (userRole === "admin" || userRole === "staff") && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, "Paid")}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(invoice)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      {editInvoice && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
              <DialogDescription>Update invoice details and items.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label>Patient</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={editInvoice.patientId}
                  onChange={(e) => handleEditInvoiceChange("patientId", e.target.value)}
                >
                  <option value="">Select patient</option>
                  {patients?.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
                </div>
                {editInvoice.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-3 p-3 border rounded">
                    <div className="col-span-4">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={e => handleEditInvoiceItemChange(idx, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Category</Label>
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={item.category}
                        onChange={e => handleEditInvoiceItemChange(idx, "category", e.target.value)}
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Medication">Medication</option>
                        <option value="Lab Test">Lab Test</option>
                        <option value="Room Charge">Room Charge</option>
                        <option value="Procedure">Procedure</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => handleEditInvoiceItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit Price (₹)</Label>
                      <Input
                        type="number"
                        value={item.unitPrice || ""}
                        onChange={e => handleEditInvoiceItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Total</Label>
                      <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                        ₹{item.total.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount (₹)</Label>
                  <Input
                    type="number"
                    value={editInvoice.discount}
                    onChange={e => handleEditInvoiceChange("discount", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={editInvoice.notes || ""}
                    onChange={(e) => handleEditInvoiceChange("notes", e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{editInvoice.items.reduce((sum, item) => sum + item.total, 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>₹{(editInvoice.items.reduce((sum, item) => sum + item.total, 0) * 0.1).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{editInvoice.discount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{(editInvoice.items.reduce((sum, item) => sum + item.total, 0) * 1.1 - (editInvoice.discount || 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleUpdateInvoice} className="w-full bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BillingInvoices;
