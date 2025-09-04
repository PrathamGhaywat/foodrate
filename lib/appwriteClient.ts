"use client";

import { Account, Client, Databases, ID, Models, Query } from "appwrite";

// Browser client for Appwrite; uses public env vars. Ensure CORS is set in Appwrite for your domain.
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };

// Ensure an anonymous session exists (idempotent call in UI entry points)
export async function ensureAnonSession() {
  try {
    await account.get();
  } catch {
    try {
      await account.createAnonymousSession();
    } catch (e) {
      console.error("Failed to create anonymous session", e);
    }
  }
}

// Helpers to get env-configured ids
export const APPWRITE = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "foodrate",
  foodCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_FOOD_COLLECTION_ID || "food",
  reviewCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID || "review",
};

export type Food = {
  $id: string;
  name: string;
  imageUrl: string;
  description: string;
} & Models.Document;

export type Review = {
  $id: string;
  foodId: string; // assumes review has foodId attribute (string)
  username: string;
  review: string;
  rating: number; // 0..5
} & Models.Document;
