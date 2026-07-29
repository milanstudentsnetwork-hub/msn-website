import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useSiteSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("display_order", { ascending: true });
      if (!error) setSettings(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { settings, loading, refresh };
}
