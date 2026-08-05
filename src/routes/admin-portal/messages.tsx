import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminListMessages, adminMarkMessageRead, adminDeleteMessage } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

type MessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];

export const Route = createFileRoute("/admin-portal/messages")({
  component: () => (
    <AdminShell>
      <MessagesAdminPage />
    </AdminShell>
  ),
});

function MessagesAdminPage() {
  const listFn = useServerFn(adminListMessages);
  const markReadFn = useServerFn(adminMarkMessageRead);
  const deleteFn = useServerFn(adminDeleteMessage);

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setMessages(await listFn());
    } catch {
      toast.error("Couldn't load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleRead(message: MessageRow) {
    try {
      await markReadFn({ data: { id: message.id, is_read: !message.is_read } });
      refresh();
    } catch {
      toast.error("Couldn't update this message.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Message deleted.");
      refresh();
    } catch {
      toast.error("Couldn't delete this message.");
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Contact Messages</h2>

      {loading ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {message.full_name}{" "}
                    <span className="font-normal text-muted-foreground">— {message.email}</span>
                  </p>
                  <p className="text-sm font-semibold">{message.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!message.is_read && <Badge variant="secondary">Unread</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {message.message}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleToggleRead(message)}>
                  Mark as {message.is_read ? "unread" : "read"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(message.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
