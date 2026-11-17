import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function exportProjectZip(project) {
  const zip = new JSZip();

  // Standard React + Vite wrapper files
  zip.file(
    "package.json",
    JSON.stringify(
      {
        name: (project.name || "ai-website").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "lucide-react": "^0.460.0",
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.3.4",
          vite: "^6.0.0",
        },
      },
      null,
      2
    )
  );

  zip.file(
    "index.html",
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name || "Web Construct Site"}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
  );

  zip.file(
    "src/main.jsx",
    `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`
  );

  // Add all generated files under src/
  Object.entries(project.files || {}).forEach(([filePath, content]) => {
    const cleanPath = filePath.replace(/^\/+/, "");
    const code = typeof content === "string" ? content : content?.content || "";
    zip.file(`src/${cleanPath}`, code);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const fileName = `${(project.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-v${project.version || 1}.zip`;
  saveAs(blob, fileName);
}