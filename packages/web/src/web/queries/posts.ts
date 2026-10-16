import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function usePosts(category?: string) {
  return useQuery(
    orpc.posts.list.queryOptions({
      input: category ? { category: category as "comparison" | "best-of" | "how-to" | "faq" | "alternatives" } : {},
      staleTime: 30_000,
    }),
  );
}

export function usePost(slug: string) {
  return useQuery(orpc.posts.get.queryOptions({ input: { slug }, staleTime: 30_000, retry: false }));
}

export function useUpsertPost() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.posts.upsert.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.posts.key() }),
    }),
  );
}

export function useRuns() {
  return useQuery(orpc.runs.list.queryOptions({ staleTime: 30_000 }));
}
