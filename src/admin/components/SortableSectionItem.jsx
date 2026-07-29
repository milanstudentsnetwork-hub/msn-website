import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

export default function SortableSectionItem({ section, onSave, onUploadImage }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.section_key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const [expanded, setExpanded] = useState(false);
  const [heading, setHeading] = useState(section.content?.heading ?? "");
  const [body, setBody] = useState(section.content?.body ?? "");
  const [enabled, setEnabled] = useState(section.enabled);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleToggleEnabled = async (e) => {
    const next = e.target.checked;
    setEnabled(next);
    await onSave(section.section_key, { enabled: next });
  };

  const handleSaveText = async () => {
    setSaving(true);
    await onSave(section.section_key, { content: { heading, body } });
    setSaving(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    await onUploadImage(section.section_key, file);
    setUploading(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab select-none text-slate-400 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={enabled} onChange={handleToggleEnabled} />
          Enabled
        </label>

        <div className="flex-1">
          <p className="font-medium text-slate-900">{section.label}</p>
          <p className="text-xs text-slate-400">{section.section_key}</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          {expanded ? "Collapse" : "Edit"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Heading</label>
            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Body text</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveText}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save text"}
          </button>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Section background image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 w-full text-sm"
            />
            {uploading && <p className="mt-1 text-xs text-slate-500">Uploading...</p>}
            {section.background_image_url && (
              <img
                src={section.background_image_url}
                alt=""
                className="mt-2 h-24 w-full rounded-md object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
