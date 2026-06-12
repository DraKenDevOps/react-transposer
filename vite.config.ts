import { defineConfig } from "vite"
import { crx } from "@crxjs/vite-plugin"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import manifest from "./manifest.json"

export default defineConfig({
    plugins: [react(), tailwindcss(), crx({ manifest })],
    base: "./",
    server: { port: 3000 }
})
