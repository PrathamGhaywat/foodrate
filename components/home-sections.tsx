"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StarRating } from "@/components/star-rating";
import {
  APPWRITE,
  databases,
  ensureAnonSession,
  Query,
  type Review,
  type Food,
} from "@/lib/appwriteClient";

type FoodStats = {
  foodId: string;
  count: number;
  sum: number;
  avg: number;
};

export function HomeSections() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topPick, setTopPick] = useState<{ food: Food; stats: FoodStats } | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ food: Food; stats: FoodStats }>>([]);

  useEffect(() => {
    ensureAnonSession();
  }, []);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all reviews via cursor pagination (cap at ~1000 for safety)
        const allReviews: Review[] = [];
        let cursor: string | null = null;
        const pageSize = 100;
        for (let i = 0; i < 10; i++) { // up to 1000 reviews
          const queries = [Query.limit(pageSize), Query.orderAsc("$id")];
          if (cursor) queries.push(Query.cursorAfter(cursor));
          const page = await databases.listDocuments<Review>(
            APPWRITE.databaseId,
            APPWRITE.reviewCollectionId,
            queries
          );
          allReviews.push(...page.documents);
          const last = page.documents.at(-1);
          if (!last || page.documents.length < pageSize) break;
          cursor = last.$id;
        }

        if (!alive) return;
        const byFood = new Map<string, FoodStats>();
        for (const r of allReviews) {
          if (!r.foodId) continue;
          const entry = byFood.get(r.foodId) || { foodId: r.foodId, count: 0, sum: 0, avg: 0 };
          entry.count += 1;
          entry.sum += Number(r.rating || 0);
          byFood.set(r.foodId, entry);
        }
        const stats = [...byFood.values()].map((s) => ({ ...s, avg: s.count ? s.sum / s.count : 0 }));

        // Deterministic tie-breakers
        const byAvgThenCount = (a: FoodStats, b: FoodStats) =>
          b.avg - a.avg || b.count - a.count || a.foodId.localeCompare(b.foodId);
        const byCountThenAvg = (a: FoodStats, b: FoodStats) =>
          b.count - a.count || b.avg - a.avg || a.foodId.localeCompare(b.foodId);

        // Top pick: best avg (min 2 reviews), tie-break by count then id; fallback to most-reviewed
        const candidates = stats.filter((s) => s.count >= 2).sort(byAvgThenCount);
        const topStat = candidates[0] || [...stats].sort(byCountThenAvg)[0];

        // Leaderboard: top 5 by count, tie-break by avg then id
        const topN = [...stats].sort(byCountThenAvg).slice(0, 5);

        const needIds = [topStat?.foodId, ...topN.map((s) => s.foodId)].filter(Boolean) as string[];
        const uniqueIds = Array.from(new Set(needIds));

        let foodsById = new Map<string, Food>();
        try {
          const foodsRes = await databases.listDocuments<Food>(
            APPWRITE.databaseId,
            APPWRITE.foodCollectionId,
            [Query.equal("$id", uniqueIds), Query.limit(uniqueIds.length || 1)]
          );
          foodsById = new Map(foodsRes.documents.map((f) => [f.$id, f]));
        } catch (e) {
          console.warn("Batch fetch by $id unsupported, falling back to per-id fetch", e);
          const fetched = await Promise.all(
            uniqueIds.map((id) => databases.getDocument<Food>(APPWRITE.databaseId, APPWRITE.foodCollectionId, id))
          );
          foodsById = new Map(fetched.map((f) => [f.$id, f]));
        }

        const topPickPair = topStat && foodsById.get(topStat.foodId)
          ? { food: foodsById.get(topStat.foodId) as Food, stats: topStat }
          : null;
        const leaderboardPairs = topN
          .map((s) => (foodsById.get(s.foodId) ? { food: foodsById.get(s.foodId) as Food, stats: s } : null))
          .filter(Boolean) as Array<{ food: Food; stats: FoodStats }>;

        if (!alive) return;
        setTopPick(topPickPair);
        setLeaderboard(leaderboardPairs);
      } catch (e: unknown) {
        console.error(e);
        const isErr = (x: unknown): x is { message?: string } => typeof x === "object" && x !== null && "message" in x;
        setError(isErr(e) && e.message ? e.message : "Failed to load stats");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return null;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="w-full space-y-10">
      {/* Top pick */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold">Today’s top pick</h2>
        {!topPick ? (
          <div className="text-sm text-muted-foreground">No reviews yet. Be the first to rate a food!</div>
        ) : (
          <Link
            href={`/food?id=${encodeURIComponent(topPick.food.$id)}`}
            className="flex items-center gap-4 rounded-3xl border-2 border-black/10 p-4 hover:bg-black/5"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-black/10">
              <Image src={topPick.food.imageUrl} alt={topPick.food.name} fill className="object-cover" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-lg font-bold">{topPick.food.name}</div>
              <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{topPick.food.description}</div>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <StarRating value={Math.round(topPick.stats.avg * 10) / 10} readOnly size={20} />
                <span className="text-muted-foreground">{topPick.stats.count} review(s)</span>
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* Leaderboard */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <div className="text-sm text-muted-foreground">No data yet.</div>
        ) : (
          <ol className="space-y-2">
            {leaderboard.map(({ food, stats }, idx) => (
              <li key={food.$id} className="flex items-center justify-between rounded-2xl border-2 border-black/10 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-yellow-200 font-bold">{idx + 1}</div>
                  <Link href={`/food?id=${encodeURIComponent(food.$id)}`} className="font-semibold hover:underline">
                    {food.name}
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <StarRating value={Math.round(stats.avg * 10) / 10} readOnly size={18} />
                  </div>
                  <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold">{stats.count} reviews</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
