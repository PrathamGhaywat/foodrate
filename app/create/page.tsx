"use client";

import { Suspense, useEffect, useState } from "react";
import { APPWRITE, databases, ensureAnonSession, ID } from "@/lib/appwriteClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateFoodPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl py-12">Loading…</div>}>
      <CreateFoodForm />
    </Suspense>
  );
}

function CreateFoodForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState(params.get("name") ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureAnonSession();
  }, []);

  const valid =
    name.trim().length > 0 &&
    name.trim().length <= 30 &&
    description.trim().length > 0 &&
    description.trim().length <= 200 &&
    /^https?:\/\//i.test(imageUrl);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.createDocument(
        APPWRITE.databaseId,
        APPWRITE.foodCollectionId,
        ID.unique(),
        {
          name: name.trim(),
          imageUrl: imageUrl.trim(),
          description: description.trim(),
        }
      );
      router.push(`/food/${doc.$id}`);
    } catch (e: unknown) {
      console.error(e);
      const isErr = (x: unknown): x is { message?: string } =>
        typeof x === "object" && x !== null && "message" in x;
      setError(isErr(e) && e.message ? e.message : "Failed to create food");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="mb-6 text-3xl font-extrabold">Create a new food</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-semibold">Name</label>
          <input
            className="w-full rounded-2xl border-2 border-black/10 px-4 py-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Max 30 chars</p>
        </div>
        <div>
          <label className="mb-1 block font-semibold">Image URL</label>
          <input
            className="w-full rounded-2xl border-2 border-black/10 px-4 py-3"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">Description</label>
          <textarea
            className="min-h-28 w-full rounded-2xl border-2 border-black/10 px-4 py-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Max 200 chars</p>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold shadow-[0_4px_0_#00000020] hover:bg-yellow-300 disabled:opacity-50"
          type="submit"
          disabled={!valid || loading}
        >
          {loading ? "Creating…" : "Create food"}
        </button>
      </form>
    </div>
  );
}
