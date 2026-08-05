import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminListServices, adminUpsertService, adminDeleteService } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export const Route = createFileRoute("/admin-portal/services")({
  component: () => (
    <AdminShell>
      <ServicesAdminPage />
    </AdminShell>
  ),
});

const emptyForm = {
  id: undefined as string | undefined,
  name: "",
  short_description: "",
  full_description: "",
  category: "support",
  icon_key: "",
  image_url: "",
  is_paid: false,
  price: "",
  price_note: "",
  booking_url: "",
  cta_label: "Request This Service",
  is_featured: false,
  status: "draft" as "draft" | "published",
  sort_order: "0",
};

function ServicesAdminPage() {
  const listFn = useServerFn(adminListServices);
  const upsertFn = useServerFn(adminUpsertService);
  const deleteFn = useServerFn(adminDeleteService);

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setServices(await listFn());
    } catch {
      toast.error("Couldn't load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(service: ServiceRow) {
    setForm({
      id: service.id,
      name: service.name,
      short_description: service.short_description,
      full_description: service.full_description,
      category: service.category,
      icon_key: service.icon_key ?? "",
      image_url: service.image_url ?? "",
      is_paid: service.is_paid,
      price: service.price != null ? String(service.price) : "",
      price_note: service.price_note ?? "",
      booking_url: service.booking_url ?? "",
      cta_label: service.cta_label,
      is_featured: service.is_featured,
      status: service.status,
      sort_order: String(service.sort_order),
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertFn({
        data: {
          id: form.id,
          name: form.name,
          short_description: form.short_description,
          full_description: form.full_description,
          category: form.category,
          icon_key: form.icon_key || null,
          image_url: form.image_url || null,
          is_paid: form.is_paid,
          price: form.price ? Number(form.price) : null,
          price_note: form.price_note || null,
          booking_url: form.booking_url || null,
          cta_label: form.cta_label,
          is_featured: form.is_featured,
          status: form.status,
          sort_order: Number(form.sort_order) || 0,
        },
      });
      toast.success(form.id ? "Service updated." : "Service created.");
      setOpen(false);
      refresh();
    } catch {
      toast.error("Couldn't save this service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this service? This can't be undone.")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Service deleted.");
      refresh();
    } catch {
      toast.error("Couldn't delete this service.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Services</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="coral" size="sm" onClick={openCreate}>
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="short_description">Short description</Label>
                <Input
                  id="short_description"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="full_description">Full description</Label>
                <Textarea
                  id="full_description"
                  rows={3}
                  value={form.full_description}
                  onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="icon_key">Icon key</Label>
                  <Input
                    id="icon_key"
                    placeholder="home, plane, smartphone…"
                    value={form.icon_key}
                    onChange={(e) => setForm({ ...form, icon_key: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Paid service</Label>
                <Switch
                  checked={form.is_paid}
                  onCheckedChange={(v) => setForm({ ...form, is_paid: v })}
                />
              </div>
              {form.is_paid && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_note">Price note</Label>
                    <Input
                      id="price_note"
                      placeholder="per hour, starting from…"
                      value={form.price_note}
                      onChange={(e) => setForm({ ...form, price_note: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="booking_url">Booking / payment link</Label>
                <Input
                  id="booking_url"
                  value={form.booking_url}
                  onChange={(e) => setForm({ ...form, booking_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cta_label">Button label</Label>
                  <Input
                    id="cta_label"
                    value={form.cta_label}
                    onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Featured on homepage</Label>
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <Label>Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Only published services are visible on the public site.
                  </p>
                </div>
                <Switch
                  checked={form.status === "published"}
                  onCheckedChange={(v) => setForm({ ...form, status: v ? "published" : "draft" })}
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : form.id ? "Save Changes" : "Create Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No services yet.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="capitalize">{service.category}</TableCell>
                  <TableCell>{service.is_paid ? `€${service.price ?? 0}` : "Free"}</TableCell>
                  <TableCell>
                    <Badge variant={service.status === "published" ? "default" : "outline"}>
                      {service.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{service.is_featured ? "★" : ""}</TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(service)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
