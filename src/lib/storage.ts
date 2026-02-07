import { createServerClient } from './supabase'

const ensuredBuckets = new Set<string>()

/**
 * Ensure a storage bucket exists (creates it if missing).
 * Uses in-memory cache so it only checks once per cold start.
 */
export async function ensureBucket(bucketId: string, isPublic: boolean = true) {
  if (ensuredBuckets.has(bucketId)) return

  const supabase = createServerClient()

  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.id === bucketId)

  if (!exists) {
    await supabase.storage.createBucket(bucketId, { public: isPublic })
  }

  ensuredBuckets.add(bucketId)
}
