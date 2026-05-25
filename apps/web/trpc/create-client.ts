import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function executeSilentRefresh(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/auth.refreshToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  const baseUrl = env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8000/trpc"
        : "/trpc");

  return c({
    url: baseUrl,
    async fetch(url, options) {
      let response = await fetch(url, {
        ...options,
        credentials: "include",
      });

      if (response.status === 401) {
        if (!refreshPromise) {
          refreshPromise = executeSilentRefresh(baseUrl).finally(() => {
            refreshPromise = null;
          });
        }

        const refreshSuccess = await refreshPromise;
        if (refreshSuccess) {
          // Retry original query after silent refresh
          response = await fetch(url, {
            ...options,
            credentials: "include",
          });
        }
      }

      return response;
    },
  });
};
