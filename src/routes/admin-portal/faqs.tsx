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
import { adminListFaqs, adminUpsertFaq, adminDeleteFaq } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

export const Route = createFileRoute("/admin-portal/faqs")({
  component: () => (
    <AdminShell>
      <FaqsAdminPage />
    </AdminShell>
  ),
});

const emptyForm = {
  id: undefined as string | undefined,
  question: "",
  answer: "",
  category: "general",
  status: "draft" as "draft" | "published",
  sort_order: "0",
};

function FaqsAdminPage() {
  const listFn = useServerFn(adminListFaqs);
  const upsertFn = useServerFn(adminUpsertFaq);
  const deleteFn = useServerFn(adminDeleteFaq);

  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setFaqs(await listFn());
    } catch {
      toast.error("Couldn't load FAQs.");
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

  function openEdit(faq: FaqRow) {
    setForm({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
      sort_order: String(faq.sort_order),
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
          question: form.question,
          answer: form.answer,
          category: form.category,
          status: form.status,
          sort_order: Number(form.sort_order) || 0,
        },
      });
      toast.success(form.id ? "FAQ updated." : "FAQ created.");
      setOpen(false);
      refresh();
    } catch {
      toast.error("Couldn't save this FAQ.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this FAQ? This can't be undone.")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("FAQ deleted.");
      refresh();
    } catch {
      toast.error("Couldn't delete this FAQ.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">FAQs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="coral" size="sm" onClick={openCreate}>
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  required
                  rows={4}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
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
                  <Label>Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Only published FAQs are visible on the public site.
                  </p>
                </div>
                <Switch
                  checked={form.status === "published"}
                  onCheckedChange={(v) => setForm({ ...form, status: v ? "published" : "draft" })}
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : form.id ? "Save Changes" : "Create FAQ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Order</TableHead>
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
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No FAQs yet.
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="max-w-md truncate font-medium">{faq.question}</TableCell>
                  <TableCell className="capitalize">{faq.category}</TableCell>
                  <TableCell>{faq.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={faq.status === "published" ? "default" : "outline"}>
                      {faq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(faq.id)}
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
