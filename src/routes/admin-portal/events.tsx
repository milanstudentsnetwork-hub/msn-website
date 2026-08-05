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
import {
  adminListEvents,
  adminUpsertEvent,
  adminDeleteEvent,
  adminDuplicateEvent,
} from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export const Route = createFileRoute("/admin-portal/events")({
  component: () => (
    <AdminShell>
      <EventsAdminPage />
    </AdminShell>
  ),
});

const emptyForm = {
  id: undefined as string | undefined,
  title: "",
  description: "",
  event_date: "",
  start_time: "",
  end_time: "",
  location: "",
  category: "social",
  cover_image_url: "",
  rsvp_url: "",
  capacity: "",
  price: "0",
  is_featured: false,
  status: "draft" as "draft" | "published",
  sort_order: "0",
};

function EventsAdminPage() {
  const listFn = useServerFn(adminListEvents);
  const upsertFn = useServerFn(adminUpsertEvent);
  const deleteFn = useServerFn(adminDeleteEvent);
  const duplicateFn = useServerFn(adminDuplicateEvent);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setEvents(await listFn());
    } catch {
      toast.error("Couldn't load events.");
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

  function openEdit(event: EventRow) {
    setForm({
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      start_time: event.start_time ?? "",
      end_time: event.end_time ?? "",
      location: event.location,
      category: event.category,
      cover_image_url: event.cover_image_url ?? "",
      rsvp_url: event.rsvp_url ?? "",
      capacity: event.capacity != null ? String(event.capacity) : "",
      price: String(event.price),
      is_featured: event.is_featured,
      status: event.status,
      sort_order: String(event.sort_order),
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
          title: form.title,
          description: form.description,
          event_date: form.event_date,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          location: form.location,
          category: form.category,
          cover_image_url: form.cover_image_url || null,
          rsvp_url: form.rsvp_url || null,
          capacity: form.capacity ? Number(form.capacity) : null,
          price: Number(form.price) || 0,
          is_featured: form.is_featured,
          status: form.status,
          sort_order: Number(form.sort_order) || 0,
        },
      });
      toast.success(form.id ? "Event updated." : "Event created.");
      setOpen(false);
      refresh();
    } catch {
      toast.error("Couldn't save this event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event? This can't be undone.")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Event deleted.");
      refresh();
    } catch {
      toast.error("Couldn't delete this event.");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateFn({ data: { id } });
      toast.success("Duplicated as a draft.");
      refresh();
    } catch {
      toast.error("Couldn't duplicate this event.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Events</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="coral" size="sm" onClick={openCreate}>
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Event" : "Add Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="event_date">Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    required
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start time</Label>
                  <Input
                    id="start_time"
                    placeholder="19:00"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End time</Label>
                  <Input
                    id="end_time"
                    placeholder="22:00"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cover_image_url">Cover image URL</Label>
                <Input
                  id="cover_image_url"
                  value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="rsvp_url">RSVP / ticket link</Label>
                <Input
                  id="rsvp_url"
                  value={form.rsvp_url}
                  onChange={(e) => setForm({ ...form, rsvp_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
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
                <div>
                  <Label>Featured on homepage</Label>
                </div>
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <Label>Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Only published events are visible on the public site.
                  </p>
                </div>
                <Switch
                  checked={form.status === "published"}
                  onCheckedChange={(v) => setForm({ ...form, status: v ? "published" : "draft" })}
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : form.id ? "Save Changes" : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
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
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No events yet.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.event_date}</TableCell>
                  <TableCell className="capitalize">{event.category}</TableCell>
                  <TableCell>
                    <Badge variant={event.status === "published" ? "default" : "outline"}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.is_featured ? "★" : ""}</TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(event.id)}>
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(event.id)}
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
