import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, FileText, Printer, Download, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/types/hospital";
import { useInvoices } from "@/hooks/useInvoices";

interface BillingInvoicesProps {
  userRole: "admin" | "doctor" | "staff";
}

const BillingInvoices = ({ userRole }: BillingInvoicesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const { invoices, isLoading, error, addInvoice, updateInvoice, refetch } = useInvoices();

  const [newInvoice, setNewInvoice] = useState({
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
      await addInvoice.mutateAsync({
        ...newInvoice,
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

  const handleDeleteInvoice = async (invoiceId: string) => {
    // Implement your delete logic here
    console.log("Deleting invoice with ID:", invoiceId);
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
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditInvoice(invoice)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      title="Delete Invoice"
                    >
                      <Trash className="h-5 w-5 text-red-600" />
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
