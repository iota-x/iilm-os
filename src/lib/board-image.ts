/** Public URL for a file in the `board` bucket (public, unguessable paths). */
export function boardImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/board/${path}`;
}
