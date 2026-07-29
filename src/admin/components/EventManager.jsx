import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyForm = { id: null, title: "", date: "", description: "", image_url: "" };

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (fetchError) setError(fetchError.message);
      setEvents(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleImageUpload = async (file) => {
    setUploading(true);
    setError(null);
    const path = `events/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(path, file);
    setUploading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      title: form.title,
      date: form.date,
      description: form.description,
      image_url: form.image_url,
    };

    const { error: saveError } = form.id
      ? await supabase.from("events").update(payload).eq("id", form.id)
      : await supabase.from("events").insert(payload);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    resetForm();
    fetchEvents();
  };

  const handleEdit = (event) => {
    setForm({
      id: event.id,
      title: event.title,
      date: event.date ? event.date.slice(0, 16) : "",
      description: event.description ?? "",
      image_url: event.image_url ?? "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const { error: deleteError } = await supabase.from("events").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    fetchEvents();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {form.id ? "Edit Event" : "Add Event"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Date &amp; time</label>
          <input
            type="datetime-local"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
            className="mt-1 w-full text-sm"
          />
          {uploading && <p className="mt-1 text-xs text-slate-500">Uploading...</p>}
          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              className="mt-2 h-24 w-full rounded-md object-cover"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {form.id ? "Save Changes" : "Add Event"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">All Events</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500">No events yet.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-500">
                  {new Date(event.date).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
