import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "../../lib/supabaseClient";
import SortableSectionItem from "./SortableSectionItem";

export default function LayoutManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("site_settings")
        .select("*")
        .order("display_order", { ascending: true });
      if (fetchError) setError(fetchError.message);
      setSections(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const persistOrder = async (ordered) => {
    await Promise.all(
      ordered.map((section, index) =>
        supabase
          .from("site_settings")
          .update({ display_order: index })
          .eq("section_key", section.section_key)
      )
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.section_key === active.id);
      const newIndex = prev.findIndex((s) => s.section_key === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      persistOrder(reordered);
      return reordered;
    });
  };

  const handleSaveSection = async (sectionKey, updates) => {
    setError(null);
    const { error: saveError } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("section_key", sectionKey);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSections((prev) =>
      prev.map((s) => (s.section_key === sectionKey ? { ...s, ...updates } : s))
    );
  };

  const handleUploadImage = async (sectionKey, file) => {
    setError(null);
    const path = `backgrounds/${sectionKey}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    await handleSaveSection(sectionKey, { background_image_url: data.publicUrl });
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-900">Homepage Layout</h2>
      <p className="mt-1 text-sm text-slate-500">
        Drag sections to reorder how they appear on the homepage. Toggle a section off to hide
        it, edit its heading/body text, or set a background image.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-slate-500">Loading...</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.section_key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-6 space-y-3">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.section_key}
                  section={section}
                  onSave={handleSaveSection}
                  onUploadImage={handleUploadImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
