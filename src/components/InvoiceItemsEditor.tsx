
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InvoiceItem } from "@/types/hospital";

interface Props {
  items: InvoiceItem[];
  setItems: (items: InvoiceItem[]) => void;
  readOnly?: boolean;
}

export default function InvoiceItemsEditor({ items, setItems, readOnly }: Props) {
  const handleChange = (
    idx: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === "quantity" || field === "unitPrice") {
      newItems[idx][field] = Number(value);
      newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
    } else {
      (newItems[idx][field] as any) = value;
    }
    setItems(newItems);
  };

  const handleAdd = () => {
    setItems([
      ...items,
      {
        description: "",
        category: "Consultation",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemove = (idx: number) => {
    const newItems = items.slice();
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2">
        <span className="col-span-3 font-medium">Description</span>
        <span className="col-span-2 font-medium">Category</span>
        <span className="col-span-2 font-medium">Qty</span>
        <span className="col-span-2 font-medium">Unit Price</span>
        <span className="col-span-2 font-medium">Total</span>
        <span className="col-span-1"></span>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2">
          <Input
            className="col-span-3"
            value={item.description}
            onChange={e =>
              handleChange(idx, "description", e.target.value)
            }
            disabled={readOnly}
          />
          <select
            className="col-span-2 rounded border px-2 py-1 bg-background"
            value={item.category}
            onChange={e =>
              handleChange(
                idx,
                "category",
                e.target.value as InvoiceItem["category"]
              )
            }
            disabled={readOnly}
          >
            <option value="Consultation">Consultation</option>
            <option value="Medication">Medication</option>
            <option value="Lab Test">Lab Test</option>
            <option value="Room Charge">Room Charge</option>
            <option value="Procedure">Procedure</option>
            <option value="Other">Other</option>
          </select>
          <Input
            className="col-span-2"
            type="number"
            min={1}
            value={item.quantity}
            onChange={e => handleChange(idx, "quantity", e.target.value)}
            disabled={readOnly}
          />
          <Input
            className="col-span-2"
            type="number"
            min={0}
            value={item.unitPrice}
            onChange={e => handleChange(idx, "unitPrice", e.target.value)}
            disabled={readOnly}
          />
          <Input
            className="col-span-2"
            value={item.total}
            disabled
            readOnly
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="col-span-1"
            onClick={() => handleRemove(idx)}
            disabled={readOnly}
            tabIndex={-1}
          >
            ×
          </Button>
        </div>
      ))}
      {!readOnly && (
        <Button type="button" variant="outline" onClick={handleAdd}>
          Add Item
        </Button>
      )}
    </div>
  );
}
