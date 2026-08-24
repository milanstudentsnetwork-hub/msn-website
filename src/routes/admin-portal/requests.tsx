import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListRequests, adminUpdateRequest } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type RequestRow = Database["public"]["Tables"]["service_requests"]["Row"];
type RequestStatus = RequestRow["status"];

const statuses: RequestStatus[] = [
  "new",
  "contacted",
  "in_progress",
  "awaiting_payment",
  "paid",
  "completed",
  "cancelled",
];

const statusLabel: Record<RequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  awaiting_payment: "Awaiting Payment",
  paid: "Paid",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const Route = createFileRoute("/admin-portal/requests")({
  component: () => (
    <AdminShell>
      <RequestsAdminPage />
    </AdminShell>
  ),
});

function RequestsAdminPage() {
  const listFn = useServerFn(adminListRequests);
  const updateFn = useServerFn(adminUpdateRequest);

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<RequestRow | null>(null);
  const [form, setForm] = useState({ quoted_price: "", payment_url: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setRequests(await listFn());
    } catch {
      toast.error("Couldn't load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(id: string, status: RequestStatus) {
    try {
      await updateFn({ data: { id, status } });
      await refresh();
    } catch {
      toast.error("Couldn't update status.");
    }
  }

  function openEdit(request: RequestRow) {
    setEditing(request);
    setForm({
      quoted_price: request.quoted_price != null ? String(request.quoted_price) : "",
      payment_url: request.payment_url ?? "",
      notes: request.notes ?? "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await updateFn({
        data: {
          id: editing.id,
          quoted_price: form.quoted_price ? Number(form.quoted_price) : null,
          payment_url: form.payment_url || null,
          notes: form.notes || null,
        },
      });
      toast.success("Request updated.");
      setEditing(null);
      await refresh();
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Service Requests</h2>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Quoted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No requests yet.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <p className="font-medium">{request.full_name}</p>
                    <p className="text-xs text-muted-foreground">{request.email}</p>
                  </TableCell>
                  <TableCell>{request.service_name}</TableCell>
                  <TableCell>
                    {request.quoted_price != null ? `€${request.quoted_price}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(v) => handleStatusChange(request.id, v as RequestStatus)}
                    >
                      <SelectTrigger className="h-9 w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabel[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(request)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request from {editing?.full_name}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/60 p-3 text-sm">
                <p>
                  <strong>Email:</strong> {editing.email}
                </p>
                {editing.phone && (
                  <p>
                    <strong>Phone:</strong> {editing.phone}
                  </p>
                )}
                {editing.university && (
                  <p>
                    <strong>University:</strong> {editing.university}
                  </p>
                )}
                {editing.preferred_date && (
                  <p>
                    <strong>Preferred date:</strong> {editing.preferred_date}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-line">{editing.details}</p>
                <Badge variant="outline" className="mt-2">
                  {statusLabel[editing.status]}
                </Badge>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="quoted_price">Quoted price (€)</Label>
                  <Input
                    id="quoted_price"
                    type="number"
                    step="0.01"
                    value={form.quoted_price}
                    onChange={(e) => setForm({ ...form, quoted_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_url">Payment / checkout link</Label>
                  <Input
                    id="payment_url"
                    value={form.payment_url}
                    onChange={(e) => setForm({ ...form, payment_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Internal notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
