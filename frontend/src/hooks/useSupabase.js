import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSupabaseQuery(
  table,
  { select = "*", filters = [], orderBy, limit, single = false, realtime = false } = {},
  deps = []
) {
  const [data, setData] = useState(single ? null : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const buildQuery = useCallback(() => {
    let query = supabase.from(table).select(select);
    filters.forEach(({ column, operator = "eq", value }) => {
      query = query[operator](column, value);
    });
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    if (limit) query = query.limit(limit);
    return single ? query.single() : query;
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy), limit, single]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: result, error: queryError } = await buildQuery();
    if (!mountedRef.current) return;
    if (queryError) {
      setError(queryError.message);
    } else {
      setData(result);
    }
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    let channel;
    if (realtime) {
      channel = supabase
        .channel(`realtime:${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, fetchData)
        .subscribe();
    }

    return () => {
      mountedRef.current = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, realtime, table, ...deps]);

  return { data, loading, error, refetch: fetchData };
}

export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async ({ type, values, match }) => {
      setLoading(true);
      setError(null);
      let response;
      try {
        if (type === "insert") {
          response = await supabase.from(table).insert(values).select();
        } else if (type === "update") {
          let q = supabase.from(table).update(values);
          Object.entries(match || {}).forEach(([col, val]) => { q = q.eq(col, val); });
          response = await q.select();
        } else if (type === "delete") {
          let q = supabase.from(table).delete();
          Object.entries(match || {}).forEach(([col, val]) => { q = q.eq(col, val); });
          response = await q;
        } else {
          throw new Error(`Unsupported mutation type: ${type}`);
        }
        if (response.error) throw response.error;
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [table]
  );

  return { mutate, loading, error };
}

export default useSupabaseQuery;