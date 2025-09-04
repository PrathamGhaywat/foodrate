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
      <SearchBar />
      <div className="text-sm text-muted-foreground">
        Can’t find it? {" "}
        <Link className="font-semibold underline" href="/create">
          Create a new food
        </Link>
      </div>
    </div>
  );
}
