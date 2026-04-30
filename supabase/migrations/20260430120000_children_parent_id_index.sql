-- children.parent_id RLS sorgusu için index.
-- "parent_id = auth.uid()" policy'si her veli sayfa açılışında çalışır;
-- index olmadan binlerce satırda full scan olur.

CREATE INDEX IF NOT EXISTS children_parent_idx
  ON public.children (parent_id);
