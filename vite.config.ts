import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { reactClickToComponent } from "vite-plugin-react-click-to-component"

// Set the editor path explicitly to open in Antigravity IDE
process.env.LAUNCH_EDITOR = "/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), reactClickToComponent()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
