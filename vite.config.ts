import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.APP_BASE ?? "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "OpnFitnes — Workout Buddy",
        short_name: "OpnFitnes",
        description:
          "Generate personalized workouts in seconds. Bring your own AI key. 100% on-device.",
        theme_color: "#0c0f1a",
        background_color: "#0c0f1a",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      workbox: {
        navigateFallbackDenylist: [/^\/openrouter/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/openrouter\.ai\/.*/i,
            handler: "NetworkOnly",
            method: "GET",
          },
        ],
      },
    }),
  ],
});
