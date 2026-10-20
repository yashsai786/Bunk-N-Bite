// TanStack Start & Vite configuration
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function emailApiPlugin(): Plugin {
  return {
    name: "email-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/send-email", async (req, res, next) => {
        if (req.method !== "POST") return next();

        let rawBody = "";
        req.on("data", (chunk: any) => {
          rawBody += chunk;
        });

        req.on("end", async () => {
          try {
            const body = JSON.parse(rawBody);
            const { sendMailViaNodemailer } = await import("./src/lib/server/mailer");
            const result = await sendMailViaNodemailer(body);
            res.statusCode = result.success ? 200 : 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, error: err?.message || "Failed to parse body" }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [emailApiPlugin()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
