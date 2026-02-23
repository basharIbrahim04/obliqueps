import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type Estimate, type PrintSettings } from "@/lib/estimator";
import { Send, MessageCircle, MapPin } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PALESTINE_CITIES = [
  "Ramallah", "Nablus", "Hebron", "Bethlehem", "Jenin",
  "Tulkarm", "Qalqilya", "Jericho", "Salfit", "Tubas",
  "Gaza", "Khan Yunis", "Rafah", "Deir al-Balah",
  "Jerusalem", "Birzeit", "Beit Jala", "Beit Sahour",
];

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  location: z.string().min(1, "Please select a location"),
  address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
});

interface OrderFormProps {
  file: File;
  estimate: Estimate;
  settings: PrintSettings;
}

const WHATSAPP_NUMBER = "970594066792";

const OrderForm = ({ file, estimate, settings }: OrderFormProps) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", location: "", address: "", notes: "",
  });
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

    let fileUrl: string | null = null;
    try {
      const timestamp = Date.now();
      const filePath = `${timestamp}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("order-files")
        .upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("order-files")
          .getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
      }
    } catch {
      // File upload is best-effort
    }

    const { error } = await supabase.from("orders").insert({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || null,
      file_name: file.name,
      file_size: file.size,
      file_url: fileUrl,
      material: settings.material.id,
      color: settings.material.colorLabels[settings.colorIndex],
      infill: settings.infill,
      layer_height: settings.layerHeight,
      wall_thickness: settings.wallThickness,
      supports: settings.supports,
      estimated_weight: estimate.weightGrams,
      estimated_time: estimate.printTimeHours,
      estimated_cost: estimate.totalCost,
      delivery_method: form.location,
      priority: settings.priority,
      notes: [form.location, form.address, form.notes].filter(Boolean).join(" | "),
    });

    if (!error) {
      try {
        await supabase.functions.invoke("send-order-email", {
          body: {
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            fileName: file.name,
            fileSize: file.size,
            fileUrl,
            material: settings.material.name,
            color: settings.material.colorLabels[settings.colorIndex],
            infill: settings.infill,
            layerHeight: settings.layerHeight,
            wallThickness: settings.wallThickness,
            supports: settings.supports,
            estimatedWeight: estimate.weightGrams,
            estimatedTime: `${estimate.printTimeHours}h ${estimate.printTimeMinutes}m`,
            estimatedCost: estimate.totalCost,
            priority: settings.priority,
            location: form.location,
            address: form.address,
            notes: form.notes,
          },
        });
      } catch {
        // Email is best-effort
      }
    }

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Failed to submit order. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Order Submitted!", description: "We'll get back to you shortly." });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to inquire about a 3D print:\n` +
    `File: ${file.name}\n` +
    `Material: ${settings.material.name}\n` +
    `Color: ${settings.material.colorLabels[settings.colorIndex]}\n` +
    `Weight: ${estimate.weightGrams}g\n` +
    `Price: ₪${estimate.totalCost.toFixed(2)}\n` +
    `Time: ${estimate.printTimeHours}h ${estimate.printTimeMinutes}m`
  );

  return (
    <div className="editorial-panel border border-border p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} type="email" />
        <Field label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1.5 font-sans font-semibold">
            <MapPin className="w-3 h-3 inline mr-1" />
            Location
          </label>
          <select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={`w-full bg-background border px-3 py-2 text-sm focus:outline-none transition-colors appearance-none
              ${errors.location ? "border-destructive" : "border-border focus:border-primary"}`}
          >
            <option value="">Select city...</option>
            {PALESTINE_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
        </div>
      </div>

      {form.location && (
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1.5 font-sans font-semibold">
            Exact Address in {form.location}
          </label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            maxLength={300}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="Street, building, floor..."
          />
        </div>
      )}

      <div>
        <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1.5 font-sans font-semibold">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          maxLength={500}
          className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
          placeholder="Special instructions..."
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting} className="flex-1 tracking-[0.15em] text-xs uppercase font-semibold">
          <Send className="w-3.5 h-3.5 mr-2" />
          {submitting ? "Submitting..." : "Submit Order"}
        </Button>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-green-700/30 bg-green-700/10 text-green-800 text-xs tracking-[0.1em] uppercase font-semibold flex items-center gap-2 hover:bg-green-700/20 transition-colors"
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
    <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1.5 font-sans font-semibold">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-background border px-3 py-2 text-sm focus:outline-none transition-colors
        ${error ? "border-destructive" : "border-border focus:border-primary"}`}
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default OrderForm;
