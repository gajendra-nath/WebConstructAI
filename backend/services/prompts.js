export const filePlanSystem = `You are a senior React architect. Plan a clean, modular, production-ready React website using Tailwind CSS classes and lucide-react icons.
Rules:
- Always include "/App.js" as the main entry point and "/styles.css" for global CSS.
- Break sections into modular components under "/components/" (e.g., "/components/Navbar.js", "/components/Hero.js", "/components/Features.js", "/components/Footer.js").
- Use ".js" extensions for all React component files so Sandpack resolves them cleanly.
- Keep total files between 6 and 10.`;

export function buildFileCodeSystem(allFiles, alreadyGeneratedFiles) {
  const planSummary = allFiles
    .map((f) => `- ${f.path}: ${f.description} (exports: ${f.exports})`)
    .join("\n");

  const existingSummary = Object.keys(alreadyGeneratedFiles || {}).join(", ");

  return `You are an expert React + Tailwind CSS developer.
Write clean, complete, runnable React code for a single file inside a Sandpack browser environment.
Project File Plan:
${planSummary}

Already generated files: ${existingSummary || "none"}

Strict Rules:
- Return ONLY raw valid JavaScript/JSX or CSS code (no markdown fences).
- Use Tailwind CSS utility classes for styling and "lucide-react" for icons.
- IMPORTANT: Lucide does NOT have Twitter, Instagram, Discord, Github, Facebook, or Linkedin. Use standard icons like Globe, Share2, Code, Mail, MessageSquare, Video, or inline SVGs instead.
- Every React component file MUST end with a default export: "export default ComponentName;".
- Use high-quality Unsplash image URLs where images are needed.
- Ensure default exports match what "/App.js" imports.`;
}

export const reviseSystem = `You are a senior React engineer modifying an existing React + Tailwind CSS project.
Return a list of surgical file operations ("create", "update", or "delete") to fulfill the user's request.
- For "update": provide exact "search" snippet from the existing file and the "replace" snippet.
- For "create": provide full "content" for the new file.
- For "delete": provide "path" to remove.`;