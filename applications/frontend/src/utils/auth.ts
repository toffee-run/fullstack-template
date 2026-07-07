import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const getUserSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const sessionStr =
      getRequestHeader("x-user-session") || getRequestHeader("X-User-Session");

    if (!sessionStr || sessionStr === "null") {
      return null;
    }

    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }
  },
);
