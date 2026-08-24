import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
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
import {
  adminListAccommodationRequests,
  adminUpdateAccommodationRequest,
  adminDeleteAccommodationRequest,
} from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type RequestRow = Database["public"]["Tables"]["accommodation_requests"]["Row"];
type RequestStatus = RequestRow["status"];

const statuses: RequestStatus[] = ["new", "under_review", "matched", "closed"];
const statusLabel: Record<RequestStatus, string> = {
  new: "New",
  under_review: "Under Review",
  matched: "Matched",
  closed: "Closed",
};

const ROOM_TYPE_LABEL: Record<string, string> = {
  studio: "Studio / Monolocale",
  single_shared_flat: "Single room in a shared flat",
  shared_bed: "Shared bed space",
};

export const Route = createFileRoute("/admin-portal/accommodation-requests")({
  component: () => (
    <AdminShell>
      <AccommodationRequestsAdminPage />
    </AdminShell>
  ),
});

function AccommodationRequestsAdminPage() {
  const listFn = useServerFn(adminListAccommodationRequests);
  const updateFn = useServerFn(adminUpdateAccommodationRequest);
  const deleteFn = useServerFn(adminDeleteAccommodationRequest);

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<RequestRow | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setRequests(await listFn());
    } catch {
      toast.error("Couldn't load accommodation requests.");
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

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this request? This can't be undone.")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Request deleted.");
      setViewing(null);
      await refresh();
    } catch {
      toast.error("Couldn't delete this request.");
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Accommodation Requests</h2>
      <p className="mt-1 text-sm text-muted-foreground">Students looking for a room.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Looking for</TableHead>
              <TableHead>Budget</TableHead>
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
                    <p className="font-medium">
                      {request.first_name} {request.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{request.email}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {ROOM_TYPE_LABEL[request.room_type] ?? request.room_type}
                    <span className="block text-xs text-muted-foreground capitalize">
                      {request.stay_type.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>{request.budget_range}</TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(v) => handleStatusChange(request.id, v as RequestStatus)}
                    >
                      <SelectTrigger className="h-9 w-[150px]">
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
                    <Button size="sm" variant="ghost" onClick={() => setViewing(request)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewing?.first_name} {viewing?.last_name}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-muted/60 p-3">
                <p>
                  <strong>Email:</strong> {viewing.email}
                </p>
                <p>
                  <strong>Phone:</strong> {viewing.phone}
                </p>
                <p>
                  <strong>Gender:</strong> {viewing.gender.replace(/_/g, " ")}
                </p>
                <p>
                  <strong>Move immediately:</strong> {viewing.move_immediately ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Stay type:</strong> {viewing.stay_type.replace("_", " ")}
                </p>
                {viewing.date_from && (
                  <p>
                    <strong>From:</strong> {viewing.date_from}
                  </p>
                )}
                {viewing.date_until && (
                  <p>
                    <strong>Until:</strong> {viewing.date_until}
                  </p>
                )}
                <p>
                  <strong>Needs contract:</strong> {viewing.needs_contract ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Room type:</strong>{" "}
                  {ROOM_TYPE_LABEL[viewing.room_type] ?? viewing.room_type}
                </p>
                <p>
                  <strong>Budget:</strong> {viewing.budget_range}
                </p>
                <p>
                  <strong>Max roommates:</strong> {viewing.max_roommates}
                </p>
              </div>
              <div>
                <p className="font-medium">Location preferences</p>
                <p className="whitespace-pre-line text-muted-foreground">
                  {viewing.location_preferences}
                </p>
              </div>
              {viewing.notes && (
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="whitespace-pre-line text-muted-foreground">{viewing.notes}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => handleDelete(viewing.id)}
              >
                Delete request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
