import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type Estimate, type PrintSettings } from "@/lib/estimator";
import { Send, MessageCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  delivery: z.enum(["pickup", "delivery"]),
  notes: z.string().trim().max(500).optional(),
});

interface OrderFormProps {
  file: File;
  estimate: Estimate;
  settings: PrintSettings;
}

const OrderForm = ({ file, estimate, settings }: OrderFormProps) => {
  const [form, setForm] = useState<{ name: string; email: string; phone: string; delivery: "pickup" | "delivery"; notes: string }>({ name: "", email: "", phone: "", delivery: "pickup", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const result = orderSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || null,
      file_name: file.name,
      file_size: file.size,
      material: settings.material.id,
      color: settings.material.colorLabels[settings.colorIndex],
      infill: settings.infill,
      layer_height: settings.layerHeight,
      wall_thickness: settings.wallThickness,
      supports: settings.supports,
      estimated_weight: estimate.weightGrams,
      estimated_time: estimate.printTimeHours,
      estimated_cost: estimate.totalCost,
      delivery_method: form.delivery,
      priority: settings.priority,
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Failed to submit order. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Order Submitted!", description: "We'll get back to you shortly." });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to order a 3D print:\n` +
    `File: ${file.name}\n` +
    `Material: ${settings.material.name}\n` +
    `Weight: ${estimate.weightGrams}g\n` +
    `Price: $${estimate.totalCost.toFixed(2)}\n` +
    `Time: ${estimate.printTimeHours}h`
  );

  return (
    <div className="glass-panel rounded-lg p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} type="email" />
        <Field label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div>
          <label className="block text-xs font-display tracking-widest uppercase text-muted-foreground mb-1.5">Delivery</label>
          <div className="flex gap-2">
            {(["pickup", "delivery"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setForm({ ...form, delivery: d })}
                className={`flex-1 py-2 rounded border text-xs font-display uppercase tracking-wider transition-all
                  ${form.delivery === d ? "border-primary bg-primary/10 text-primary" : "border-border glass-panel text-muted-foreground"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-display tracking-widest uppercase text-muted-foreground mb-1.5">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          maxLength={500}
          className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
          placeholder="Special instructions..."
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting} className="flex-1 font-display tracking-wider text-xs">
          <Send className="w-3.5 h-3.5 mr-2" />
          {submitting ? "Submitting..." : "Submit Order"}
        </Button>
        <a
          href={`https://wa.me/?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-md border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-display tracking-wider flex items-center gap-2 hover:bg-green-500/20 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, error, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; type?: string;
}) => (
  <div>
    <label className="block text-xs font-display tracking-widest uppercase text-muted-foreground mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-secondary/50 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors
        ${error ? "border-destructive" : "border-border focus:border-primary"}`}
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default OrderForm;
