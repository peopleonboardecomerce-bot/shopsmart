import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentMap = Record<string, string>;

export const useSiteContent = (section: string) => {
  return useQuery({
    queryKey: ["site_content", section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("section", section);
      if (error) throw error;
      const map: SiteContentMap = {};
      data?.forEach((row) => {
        map[row.key] = row.value;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSiteContentAll = () => {
  return useQuery({
    queryKey: ["site_content_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("section, key, value")
        .order("section")
        .order("key");
      if (error) throw error;
      const map: Record<string, SiteContentMap> = {};
      data?.forEach((row) => {
        if (!map[row.section]) map[row.section] = {};
        map[row.section][row.key] = row.value;
      });
      return map;
    },
  });
};

export const useUpdateSiteContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { section: string; key: string; value: string }[]) => {
      for (const u of updates) {
        const { error } = await supabase
          .from("site_content")
          .update({ value: u.value })
          .eq("section", u.section)
          .eq("key", u.key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
      queryClient.invalidateQueries({ queryKey: ["site_content_all"] });
    },
  });
};
