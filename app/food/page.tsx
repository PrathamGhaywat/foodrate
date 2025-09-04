"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { StarRating } from "@/components/star-rating";
import {
  APPWRITE,
  databases,
  ensureAnonSession,
  Query,
  ID,
  type Food,
  type Review,
} from "@/lib/appwriteClient";

export default function FoodPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <FoodPageInner />
    </Suspense>
  );
}

function FoodPageInner() {
  const params = useSearchParams();
  const id = params.get("id");

  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [reviewsSupported, setReviewsSupported] = useState(true);
  const [reviewsSupportMsg, setReviewsSupportMsg] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = username.trim().length > 0 && reviewText.trim().length > 0 && reviewText.length <= 500 && rating >= 0 && rating <= 5;

  useEffect(() => {
    ensureAnonSession();
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadFood() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const doc = await databases.getDocument<Food>(
          APPWRITE.databaseId,
          APPWRITE.foodCollectionId,
          String(id)
        );
        if (!alive) return;
        setFood(doc);
      } catch (e: unknown) {
        if (!alive) return;
        console.error(e);
        const isErr = (x: unknown): x is { message?: string } => typeof x === "object" && x !== null && "message" in x;
        setError(isErr(e) && e.message ? e.message : "Failed to load food");
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadFood();
    return () => {
      alive = false;
    };
  }, [id]);

  async function loadReviews(nextCursor?: string | null) {
    if (!id) return;
    setRevLoading(true);
    try {
      const filters = [Query.equal("foodId", String(id)), Query.limit(10)];
      if (nextCursor) filters.push(Query.cursorAfter(nextCursor));
      const res = await databases.listDocuments<Review>(
        APPWRITE.databaseId,
        APPWRITE.reviewCollectionId,
        filters
      );
      setReviews((prev) => (nextCursor ? [...prev, ...res.documents] : res.documents));
      setHasMore(res.documents.length >= 10);
      setCursor(res.documents.at(-1)?.$id ?? null);
    } catch (e) {
      console.error(e);
      const msg = (e as { message?: string } | null)?.message || "";
      if (msg.toLowerCase().includes("attribute not found") && msg.toLowerCase().includes("foodid")) {
        setReviewsSupported(false);
        setReviewsSupportMsg('The review collection is missing the "foodId" attribute. Add it to enable reviews.');
        setReviews([]);
        setHasMore(false);
        setCursor(null);
      }
    } finally {
      setRevLoading(false);
    }
  }

  useEffect(() => {
    setReviews([]);
    setCursor(null);
    setHasMore(true);
    if (id) loadReviews(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !canSubmit || !reviewsSupported) return;
    setSubmitting(true);
    try {
      const payload: Pick<Review, "foodId" | "username" | "review" | "rating"> = {
        foodId: String(id),
        username: username.trim(),
        review: reviewText.trim(),
        rating,
      };
      const doc = await databases.createDocument<Review>(
        APPWRITE.databaseId,
        APPWRITE.reviewCollectionId,
        ID.unique(),
        payload
      );
      setReviews((prev) => [doc, ...prev]);
      setUsername("");
      setReviewText("");
      setRating(0);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (!id) return <div className="p-8 text-red-600">Missing id in URL (use /food?id=...)</div>;
  if (loading) return <div className="p-8">Loading…</div>;
  if (error || !food) return <div className="p-8 text-red-600">{error ?? "Not found"}</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <div className="relative h-48 w-48 overflow-hidden rounded-3xl border-2 border-black/10">
          <Image src={food.imageUrl} alt={food.name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold">{food.name}</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">{food.description}</p>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Average rating</div>
            <StarRating value={averageRating} readOnly />
            <div className="text-xs text-muted-foreground">{reviews.length} review(s)</div>
          </div>
        </div>
      </div>

      <form onSubmit={submitReview} className="rounded-3xl border-2 border-black/10 p-6">
        <h2 className="mb-3 text-2xl font-bold">Write a review</h2>
        {!reviewsSupported && (
          <div className="mb-4 rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
            {reviewsSupportMsg}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Username</label>
            <input
              className="w-full rounded-2xl border-2 border-black/10 px-4 py-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={!reviewsSupported}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Rating</label>
            <StarRating value={rating} onChange={setRating} readOnly={!reviewsSupported} />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-semibold">Review</label>
          <textarea
            className="min-h-28 w-full rounded-2xl border-2 border-black/10 px-4 py-3"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
            required
            disabled={!reviewsSupported}
          />
          <div className="mt-1 text-xs text-muted-foreground">{reviewText.length}/500</div>
        </div>
        <button
          className="mt-4 rounded-2xl bg-yellow-400 px-5 py-3 font-bold shadow-[0_4px_0_#00000020] hover:bg-yellow-300 disabled:opacity-50"
          type="submit"
          disabled={!canSubmit || submitting || !reviewsSupported}
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>

      <section>
        <h2 className="mb-3 text-2xl font-bold">Reviews</h2>
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.$id} className="rounded-3xl border-2 border-black/10 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.username}</div>
                <StarRating value={r.rating} readOnly />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.review}</p>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            className="mt-4 rounded-2xl border-2 border-black/10 px-4 py-2 font-semibold hover:bg-black/5 disabled:opacity-50"
            disabled={revLoading}
            onClick={() => loadReviews(cursor)}
          >
            {revLoading ? "Loading…" : "Load more"}
          </button>
        )}
      </section>
    </div>
  );
}
