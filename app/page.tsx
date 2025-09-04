import Link from "next/link";
import { SearchBar } from "@/components/search-bar";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="space-y-3">
        <h1 className="text-balance text-5xl font-extrabold sm:text-6xl">FoodRate</h1>
        <p className="text-pretty text-lg text-muted-foreground">
          Find a food, rate it from 0–5 stars, and leave a tasty review.
        </p>
      </div>
      <div className="relative w-full max-w-xl">
        <SearchBar />
        {/* Decorative food emojis */}
        <span aria-hidden className="pointer-events-none absolute -top-8 -left-10 -rotate-12 text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍕</span>
        <span aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rotate-6 text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍝</span>
        <span aria-hidden className="pointer-events-none absolute -top-6 -right-8 rotate-12 text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍗</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-7 -left-6 rotate-[-8deg] text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🥦</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-9 left-1/4 rotate-3 text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍅</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-8 right-1/4 -rotate-6 text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🥟</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-6 rotate-[-14deg] text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍔</span>
        <span aria-hidden className="pointer-events-none absolute -top-9 right-1/3 rotate-[18deg] text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🧀</span>
      </div>
      <div className="text-sm text-muted-foreground">
        Can’t find it? {" "}
        <Link className="font-semibold underline" href="/create">
          Create a new food
        </Link>
      </div>
    </div>
  );
}
