"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APPWRITE, databases, ensureAnonSession, Query } from "@/lib/appwriteClient";
import type { Food } from "@/lib/appwriteClient";
import { cn } from "@/lib/utils";

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchBar({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const showDropdown = dq.length > 0;

  useEffect(() => {
    ensureAnonSession();
  }, []);

  useEffect(() => {
    let alive = true;
    async function run() {
      const qTrim = dq.trim();
      if (!qTrim) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await databases.listDocuments<Food>(
          APPWRITE.databaseId,
          APPWRITE.foodCollectionId,
          [
            // Query.search requires a fulltext index on `name`
            Query.search("name", qTrim),
            Query.limit(10),
          ]
        );
        if (!alive) return;
        setResults(res.documents);
      } catch (e) {
        // Fallback when no fulltext index is defined: fetch a page and filter client-side
        const message = (e as { message?: string } | undefined)?.message || "";
        if (message.toLowerCase().includes("fulltext index")) {
          try {
            const res = await databases.listDocuments<Food>(
              APPWRITE.databaseId,
              APPWRITE.foodCollectionId,
              [Query.limit(50)]
            );
            if (!alive) return;
            const filtered = res.documents.filter((f) =>
              f.name?.toLowerCase().includes(qTrim.toLowerCase())
            );
            setResults(filtered.slice(0, 10));
          } catch (e2) {
            console.error(e2);
            if (!alive) return;
            setResults([]);
          }
        } else {
          console.error(e);
          if (!alive) return;
          setResults([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [dq]);

  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <input
        className="w-full rounded-2xl border-2 border-black/10 px-5 py-4 text-lg shadow-[0_4px_0_#00000020] focus:shadow-[0_6px_0_#00000030] focus:outline-none"
        placeholder="Search tasty foods..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {showDropdown && (
        <div className="absolute z-10 mt-2 w-full rounded-2xl border-2 border-black/10 bg-white p-2 shadow-lg">
          {loading && <div className="p-3 text-sm">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="p-3 text-sm">
              No results. <Link className="font-semibold underline" href={`/create?name=${encodeURIComponent(dq)}`}>Create “{dq}”</Link>
            </div>
          )}
          {!loading && results.map((f) => (
            <Link
              key={f.$id}
              href={`/food?id=${encodeURIComponent(f.$id)}`}
              className="block rounded-xl px-3 py-2 hover:bg-black/5"
            >
              {f.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
