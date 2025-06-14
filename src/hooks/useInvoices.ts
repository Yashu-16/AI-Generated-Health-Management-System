
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types/hospital";

// Helper to map Supabase row to Invoice type
const mapInvoice = (row: any): Invoice => ({
  id: row.id,
  patientId: row.patient_id,
  invoiceNumber: row.invoice_number,
  issueDate: row.issue_date ? new Date(row.issue_date) : new Date(),
  dueDate: row.due_date ? new Date(row.due_date) : new Date(),
  items: row.items ?? [],
  subtotal: Number(row.subtotal),
  tax: Number(row.tax),
  discount: Number(row.discount),
  total: Number(row.total),
  status: row.status,
  paymentMethod: row.payment_method || undefined,
  paymentDate: row.payment_date ? new Date(row.payment_date) : undefined,
  notes: row.notes,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
});

// Fetch all invoices
export function useInvoices() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapInvoice);
    },
  });

  // Add invoice
  const addInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => {
      const insertData = {
        patient_id: invoice.patientId,
        invoice_number: invoice.invoiceNumber,
        issue_date: invoice.issueDate.toISOString().slice(0, 10),
        due_date: invoice.dueDate.toISOString().slice(0, 10),
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        discount: invoice.discount,
        total: invoice.total,
        status: invoice.status,
        payment_method: invoice.paymentMethod,
        payment_date: invoice.paymentDate ? invoice.paymentDate.toISOString().slice(0,10) : null,
        notes: invoice.notes,
      };
      const { data, error } = await supabase.from("invoices").insert([insertData]).select().single();
      if (error) throw error;
      return mapInvoice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }
  });

  // Update invoice
  const updateInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      const updateData = {
        patient_id: invoice.patientId,
        invoice_number: invoice.invoiceNumber,
        issue_date: invoice.issueDate.toISOString().slice(0, 10),
        due_date: invoice.dueDate.toISOString().slice(0, 10),
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        discount: invoice.discount,
        total: invoice.total,
        status: invoice.status,
        payment_method: invoice.paymentMethod,
        payment_date: invoice.paymentDate ? invoice.paymentDate.toISOString().slice(0,10) : null,
        notes: invoice.notes,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from("invoices").update(updateData).eq("id", invoice.id).select().single();
      if (error) throw error;
      return mapInvoice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }
  });

  return {
    invoices: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    addInvoice,
    updateInvoice,
  };
}
