
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { InvoiceItem } from "@/types/hospital";

interface InvoiceItemsEditorProps {
  items: InvoiceItem[];
  setItems: (items: InvoiceItem[]) => void;
}

const categories = [
  "Consultation",
  "Laboratory",
  "Radiology", 
  "Medication",
  "Surgery",
  "Room Charges",
  "Equipment",
  "Other"
];

const InvoiceItemsEditor = ({ items, setItems }: InvoiceItemsEditorProps) => {
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate total when quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : Number(newItems[index].quantity);
      const unitPrice = field === 'unitPrice' ? Number(value) : Number(newItems[index].unitPrice);
      newItems[index].total = quantity * unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      description: "",
      category: "Consultation",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
          <div className="col-span-3">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="Item description"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Category</label>
            <Select 
              value={item.category} 
              onValueChange={(value) => updateItem(index, 'category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium">Qty</label>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Unit Price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice || ""}
              onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Total</label>
            <Input
              value={item.total}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceItemsEditor;
