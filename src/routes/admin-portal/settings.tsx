import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminListSettings, adminUpsertSetting } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-portal/settings")({
  component: () => (
    <AdminShell>
      <SettingsAdminPage />
    </AdminShell>
  ),
});

const groups: { title: string; keys: string[] }[] = [
  { title: "Homepage Hero", keys: ["hero_title", "hero_subtitle", "hero_cta_primary", "hero_cta_secondary"] },
  { title: "Contact Info", keys: ["contact_email", "contact_phone", "whatsapp_url"] },
  { title: "Social Links", keys: ["instagram_url", "tiktok_url", "linkedin_url"] },
];

const labels: Record<string, string> = {
  hero_title: "Hero title",
  hero_subtitle: "Hero subtitle",
  hero_cta_primary: "Primary button label",
  hero_cta_secondary: "Secondary button label",
  contact_email: "Contact email",
  contact_phone: "Contact phone",
  whatsapp_url: "WhatsApp link",
  instagram_url: "Instagram link",
  tiktok_url: "TikTok link",
  linkedin_url: "LinkedIn link",
};

const longFields = new Set(["hero_subtitle"]);

function SettingsAdminPage() {
  const listFn = useServerFn(adminListSettings);
  const upsertFn = useServerFn(adminUpsertSetting);

  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await listFn();
        setValues(Object.fromEntries(settings.map((s) => [s.key, s.value])));
      } catch {
        toast.error("Couldn't load settings.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(values).map(([key, value]) => upsertFn({ data: { key, value } })),
      );
      toast.success("Settings saved.");
    } catch {
      toast.error("Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Site Settings</h2>
        <Button type="submit" disabled={saving} variant="coral" size="sm">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold">{group.title}</h3>
            <div className="mt-4 space-y-4">
              {group.keys.map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{labels[key] ?? key}</Label>
                  {longFields.has(key) ? (
                    <Textarea
                      id={key}
                      rows={2}
                      value={values[key] ?? ""}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      id={key}
                      value={values[key] ?? ""}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
