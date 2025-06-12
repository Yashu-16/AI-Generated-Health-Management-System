import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, DollarSign, FileText, CreditCard, TrendingUp, Printer, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice, InvoiceItem } from "@/types/hospital";

interface BillingInvoicesProps {
  userRole: "admin" | "doctor" | "staff";
}

const BillingInvoices = ({ userRole }: BillingInvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "inv1",
      patientId: "1",
      invoiceNumber: "INV-2024-001",
      issueDate: new Date("2024-06-10"),
      dueDate: new Date("2024-07-10"),
      items: [
        {
          description: "Cardiology Consultation",
          quantity: 1,
          unitPrice: 200,
          total: 200,
          category: "Consultation"
        },
        {
          description: "ECG Test",
          quantity: 1,
          unitPrice: 150,
          total: 150,
          category: "Lab Test"
        },
        {
          description: "Room Charge (Private Room)",
          quantity: 3,
          unitPrice: 300,
          total: 900,
          category: "Room Charge"
        }
      ],
      subtotal: 1250,
      tax: 125,
      discount: 0,
      total: 1375,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "inv2",
      patientId: "2",
      invoiceNumber: "INV-2024-002",
      issueDate: new Date("2024-06-11"),
      dueDate: new Date("2024-07-11"),
      items: [
        {
          description: "Emergency Room Visit",
          quantity: 1,
          unitPrice: 500,
          total: 500,
          category: "Consultation"
        },
        {
          description: "Blood Work Panel",
          quantity: 1,
          unitPrice: 200,
          total: 200,
          category: "Lab Test"
        }
      ],
      subtotal: 700,
      tax: 70,
      discount: 50,
      total: 720,
      status: "Paid",
      paymentMethod: "Credit Card",
      paymentDate: new Date("2024-06-12"),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  // Mock data
  const patients = [
    { id: "1", name: "John Doe", email: "john.doe@email.com" },
    { id: "2", name: "Sarah Wilson", email: "sarah.wilson@email.com" }
  ];

  const [newInvoice, setNewInvoice] = useState({
    patientId: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0, category: "Consultation" as const }],
    discount: 0,
    notes: ""
  });

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = (invoices.length + 1).toString().padStart(3, '0');
    return `INV-${year}-${nextNumber}`;
  };

  const generateUniqueBarcode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}${random}`.slice(-12); // 12 digit barcode
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

  const handleCreateInvoice = () => {
    if (!newInvoice.patientId || newInvoice.items.some(item => !item.description)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - newInvoice.discount;

    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      patientId: newInvoice.patientId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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

    setInvoices([...invoices, invoice]);
    
    // Send email notification (simulation)
    const patient = patients.find(p => p.id === newInvoice.patientId);
    console.log(`Invoice ${invoice.invoiceNumber} emailed to ${patient?.email}`);
    
    toast({
      title: "Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} has been generated with unique barcode`,
    });

    setNewInvoice({
      patientId: "",
      items: [{ description: "", quantity: 1, unitPrice: 0, total: 0, category: "Consultation" as const }],
      discount: 0,
      notes: ""
    });
    setShowAddDialog(false);
  };

  const printInvoiceWithBarcode = (invoice: Invoice) => {
    const patient = patients.find(p => p.id === invoice.patientId);
    const barcode = generateUniqueBarcode();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; border: 1px solid #000; padding: 15px; }
              .invoice-details { margin: 20px 0; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
              .items-table th { background-color: #f0f0f0; }
              .totals { margin-top: 20px; text-align: right; }
              .barcode-section { margin: 30px 0; text-align: center; border: 1px solid #000; padding: 20px; }
              .barcode { font-family: 'Courier New', monospace; font-size: 24px; letter-spacing: 3px; margin: 10px 0; }
              .barcode-lines { font-family: 'Courier New', monospace; font-size: 48px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>VISION MULTISPECIALITY HOSPITAL</h1>
              <p>Moshi-Chikhali Near RKH Blessings, Moshi,Pune -412105</p>
              <p>📞 9766660572/9146383404</p>
            </div>
            
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Patient:</strong> ${patient?.name}</p>
              <p><strong>Issue Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <p><strong>Subtotal: $${invoice.subtotal.toFixed(2)}</strong></p>
              <p><strong>Tax: $${invoice.tax.toFixed(2)}</strong></p>
              <p><strong>Discount: -$${invoice.discount.toFixed(2)}</strong></p>
              <p style="font-size: 18px;"><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
            </div>
            
            <div class="barcode-section">
              <h3>INVOICE BARCODE</h3>
              <div class="barcode-lines">||||  |||| |  ||||||  |||| |  |  ||||||||  ||</div>
              <div class="barcode">${barcode}</div>
              <p style="font-size: 12px;">Scan this barcode to access invoice details</p>
            </div>
            
            ${invoice.notes ? `<div style="margin-top: 20px;"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px;">
              <p>Thank you for choosing Vision Multispeciality Hospital</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      // Store barcode for future reference
      console.log(`Invoice ${invoice.invoiceNumber} generated with barcode: ${barcode}`);
      
      toast({
        title: "Invoice Printed",
        description: `Invoice with barcode ${barcode} has been generated`,
      });
    }
  };

  const updateInvoiceStatus = (invoiceId: string, status: "Paid" | "Overdue" | "Cancelled") => {
    setInvoices(invoices.map(inv => {
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
    }));
    
    toast({
      title: "Status Updated",
      description: `Invoice status changed to ${status}`,
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const patient = patients.find(p => p.id === invoice.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const totalRevenue = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = invoices.filter(inv => inv.status === "Overdue").reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage patient billing with barcode generation</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate an invoice with unique barcode for patient services</DialogDescription>
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
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
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
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Total</Label>
                        <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                          ${item.total.toFixed(2)}
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
                    <Label htmlFor="discount">Discount ($)</Label>
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
                      <span>${newInvoice.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>${(newInvoice.items.reduce((sum, item) => sum + item.total, 0) * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${newInvoice.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${(newInvoice.items.reduce((sum, item) => sum + item.total, 0) * 1.1 - newInvoice.discount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                  <Barcode className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">Each invoice will be generated with a unique barcode for easy tracking</span>
                </div>

                <Button onClick={handleCreateInvoice} className="w-full">
                  Create Invoice with Barcode
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overdueAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Search and manage patient invoices with barcode tracking</CardDescription>
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
                const patient = patients.find(p => p.id === invoice.patientId);
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{patient?.name}</TableCell>
                    <TableCell>{invoice.issueDate.toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.dueDate.toLocaleDateString()}</TableCell>
                    <TableCell>${invoice.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => printInvoiceWithBarcode(invoice)}
                      >
                        <Printer className="h-4 w-4" />
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
                                  <p>{patients.find(p => p.id === selectedInvoice.patientId)?.name}</p>
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
                                      <span>${item.total.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>${selectedInvoice.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Discount:</span>
                                    <span>-${selectedInvoice.discount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>${selectedInvoice.total.toFixed(2)}</span>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingInvoices;
