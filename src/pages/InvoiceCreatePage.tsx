
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePatientNames } from "@/hooks/usePatientNames";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceItemsEditor from "@/components/InvoiceItemsEditor";
import { format } from "date-fns";
import { InvoiceItem } from "@/types/hospital";

const defaultItem: InvoiceItem = {
  description: "",
  category: "Consultation",
  quantity: 1,
  unitPrice: "",
  total: 0,
};

// Function to generate auto invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

export default function InvoiceCreatePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: patients, isLoading: patientsLoading } = usePatientNames();
  const { addInvoice } = useInvoices();

  const [patientId, setPatientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [items, setItems] = useState<InvoiceItem[]>([ { ...defaultItem } ]);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<"Pending"|"Paid"|"Overdue"|"Cancelled">("Pending");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState<string>("");

  // Auto-generate invoice number on component mount
  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  // Calculated
  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + Number(item.total ?? 0), 0)
  , [items]);

  const total = useMemo(() =>
    Math.max(subtotal + Number(tax) - Number(discount), 0)
  , [subtotal, tax, discount]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      navigate("/"); // Redirect to main/billing page
    } catch (err: any) {
      toast({ title: "Failed to create invoice", description: err?.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  readOnly
                  className="bg-gray-50"
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
            <Button type="submit" className="w-full">Create Invoice</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
