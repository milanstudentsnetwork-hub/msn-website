import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Film } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListListings, adminUpdateListing, adminDeleteListing } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type ListingRow = Database["public"]["Tables"]["accommodation_listings"]["Row"];
type SourceFilter = "all" | "landlord" | "student_upload";

export const Route = createFileRoute("/admin-portal/accommodation")({
  component: () => (
    <AdminShell>
      <AccommodationAdminPage />
    </AdminShell>
  ),
});

function AccommodationAdminPage() {
  const listFn = useServerFn(adminListListings);
  const updateFn = useServerFn(adminUpdateListing);
  const deleteFn = useServerFn(adminDeleteListing);

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [editing, setEditing] = useState<ListingRow | null>(null);
  const [viewingPhotos, setViewingPhotos] = useState<ListingRow | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    neighborhood: "",
    room_type: "",
    admin_notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setListings(await listFn());
    } catch {
      toast.error("Couldn't load listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      sourceFilter === "all" ? listings : listings.filter((l) => l.listing_source === sourceFilter),
    [listings, sourceFilter],
  );

  function openEdit(listing: ListingRow) {
    setEditing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      neighborhood: listing.neighborhood,
      room_type: listing.room_type,
      admin_notes: listing.admin_notes ?? "",
    });
  }

  async function handleSetStatus(id: string, status: ListingRow["status"]) {
    try {
      await updateFn({ data: { id, status } });
      toast.success(`Listing marked ${status}.`);
      refresh();
    } catch {
      toast.error("Couldn't update this listing.");
    }
  }

  async function handleToggleFeatured(listing: ListingRow) {
    try {
      await updateFn({ data: { id: listing.id, is_featured: !listing.is_featured } });
      refresh();
    } catch {
      toast.error("Couldn't update this listing.");
    }
  }

  async function handleToggleVerified(listing: ListingRow) {
    try {
      await updateFn({ data: { id: listing.id, is_verified: !listing.is_verified } });
      refresh();
    } catch {
      toast.error("Couldn't update this listing.");
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await updateFn({
        data: {
          id: editing.id,
          title: editForm.title,
          description: editForm.description,
          price: Number(editForm.price) || 0,
          neighborhood: editForm.neighborhood,
          room_type: editForm.room_type,
          admin_notes: editForm.admin_notes || null,
        },
      });
      toast.success("Listing updated.");
      setEditing(null);
      refresh();
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Listing deleted.");
      refresh();
    } catch {
      toast.error("Couldn't delete this listing.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Accommodation Review</h2>
        <div className="flex gap-2">
          {(["all", "landlord", "student_upload"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={sourceFilter === value ? "coral" : "outline"}
              onClick={() => setSourceFilter(value)}
            >
              {value === "all"
                ? "All"
                : value === "landlord"
                  ? "Landlord/Agency"
                  : "Student Upload"}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Neighborhood</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No listings here.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="max-w-xs truncate font-medium">{listing.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {listing.images && listing.images.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setViewingPhotos(listing)}
                          className="group relative block size-12 overflow-hidden rounded-lg border border-border"
                        >
                          <img src={listing.images[0]} alt="" className="size-full object-cover" />
                          {listing.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[10px] font-bold text-white">
                              {listing.images.length}
                            </span>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                      {listing.video_url && (
                        <a
                          href={listing.video_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Watch video walkthrough"
                          className="grid size-7 shrink-0 place-items-center rounded-full bg-muted hover:bg-accent/10 hover:text-accent"
                        >
                          <Film className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={listing.listing_source === "landlord" ? "default" : "secondary"}
                    >
                      {listing.listing_source === "landlord" ? "Landlord/Agency" : "Student Upload"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <p>{listing.contact_name}</p>
                    <p className="text-muted-foreground">
                      {listing.contact_phone || listing.contact_email}
                    </p>
                  </TableCell>
                  <TableCell>{listing.rent_range || `€${listing.price}`}</TableCell>
                  <TableCell>{listing.neighborhood}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        listing.status === "published" || listing.status === "matched"
                          ? "default"
                          : listing.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={listing.is_featured}
                      onCheckedChange={() => handleToggleFeatured(listing)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={listing.is_verified}
                      onCheckedChange={() => handleToggleVerified(listing)}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    {listing.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(listing.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleSetStatus(listing.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {listing.status === "approved" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(listing.id, "published")}
                        >
                          Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleSetStatus(listing.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {listing.status === "published" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(listing.id, "matched")}
                        >
                          Mark Matched
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(listing.id, "approved")}
                        >
                          Unpublish
                        </Button>
                      </>
                    )}
                    {listing.status === "matched" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(listing.id, "published")}
                        >
                          Back to Published
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetStatus(listing.id, "closed")}
                        >
                          Close
                        </Button>
                      </>
                    )}
                    {listing.status === "closed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetStatus(listing.id, "published")}
                      >
                        Reopen
                      </Button>
                    )}
                    {listing.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetStatus(listing.id, "approved")}
                      >
                        Reconsider
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openEdit(listing)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(listing.id)}
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

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <Label htmlFor="l-title">Title</Label>
              <Input
                id="l-title"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="l-description">Description</Label>
              <Textarea
                id="l-description"
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="l-price">Price (€/month)</Label>
                <Input
                  id="l-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="l-neighborhood">Neighborhood</Label>
                <Input
                  id="l-neighborhood"
                  value={editForm.neighborhood}
                  onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="l-room_type">Room type</Label>
                <Input
                  id="l-room_type"
                  value={editForm.room_type}
                  onChange={(e) => setEditForm({ ...editForm, room_type: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="l-notes">Admin notes (internal only)</Label>
              <Textarea
                id="l-notes"
                rows={2}
                value={editForm.admin_notes}
                onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewingPhotos !== null} onOpenChange={(v) => !v && setViewingPhotos(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingPhotos?.title}</DialogTitle>
          </DialogHeader>
          {viewingPhotos?.video_url && (
            <a
              href={viewingPhotos.video_url}
              target="_blank"
              rel="noreferrer"
              className="mb-3 flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              <Film className="size-4 shrink-0" />
              <span className="truncate">{viewingPhotos.video_url}</span>
            </a>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {viewingPhotos?.images?.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded-lg border border-border object-cover"
                />
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
