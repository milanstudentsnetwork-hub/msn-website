import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyForm = { id: null, question: "", answer: "", reference_data: "", display_order: 0 };

export default function FaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("faqs")
        .select("*")
        .order("display_order", { ascending: true });
      if (fetchError) setError(fetchError.message);
      setFaqs(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      question: form.question,
      answer: form.answer,
      reference_data: form.reference_data,
      display_order: Number(form.display_order) || 0,
    };

    const { error: saveError } = form.id
      ? await supabase.from("faqs").update(payload).eq("id", form.id)
      : await supabase.from("faqs").insert(payload);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    resetForm();
    fetchFaqs();
  };

  const handleEdit = (faq) => {
    setForm({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      reference_data: faq.reference_data ?? "",
      display_order: faq.display_order ?? 0,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    const { error: deleteError } = await supabase.from("faqs").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    fetchFaqs();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {form.id ? "Edit FAQ" : "Add FAQ"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700">Question</label>
          <input
            required
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Answer</label>
          <textarea
            required
            rows={4}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Reference data <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            value={form.reference_data}
            onChange={(e) => setForm({ ...form, reference_data: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Display order</label>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {form.id ? "Save Changes" : "Add FAQ"}
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
        <h2 className="text-lg font-semibold text-slate-900">All FAQs</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : faqs.length === 0 ? (
          <p className="text-slate-500">No FAQs yet.</p>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{faq.question}</p>
                <p className="text-xs text-slate-500">Order: {faq.display_order}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
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
