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
      <div className="relative w-full max-w-xl py-10 md:py-14">
        <SearchBar />
        {/* Decorative food emojis */}
        {/* Sides (centered vertically) */}
        <span aria-hidden className="pointer-events-none absolute top-1/2 -translate-y-1/2 -left-16 -rotate-12 text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">�</span>
        <span aria-hidden className="pointer-events-none absolute top-1/2 -translate-y-1/2 -right-14 rotate-6 text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">�</span>
        {/* Bottom cluster */}
        <span aria-hidden className="pointer-events-none absolute -bottom-14 -left-12 rotate-[-8deg] text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🥦</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-16 left-1/4 rotate-3 text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍅</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-16 right-1/4 -rotate-6 text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🥟</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 rotate-[-14deg] text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🍔</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-10 right-1/3 rotate-[18deg] text-2xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)] select-none">🧀</span>
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
