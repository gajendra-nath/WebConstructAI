const PINNED_DEPENDENCIES = {
  "lucide-react": "^0.460.0",
  clsx: "^2.1.1",
  "tailwind-merge": "^2.5.4",
  "canvas-confetti": "^1.9.4",
  "framer-motion": "^11.11.11",
  "date-fns": "^4.1.0",
  axios: "^1.7.7",
};

// Common icons hallucinated by AI that do not exist in lucide-react
const LUCIDE_REPLACEMENTS = {
  Twitter: "Share2",
  Instagram: "Camera",
  Facebook: "Share2",
  Discord: "MessageSquare",
  Github: "Code",
  GitHub: "Code",
  Linkedin: "Share2",
  LinkedIn: "Share2",
  Youtube: "Video",
  YouTube: "Video",
  TikTok: "Music",
  Logo: "Sparkles",
  Gear: "Settings",
  Tick: "Check",
  Cross: "X",
  Person: "User",
  Envelope: "Mail",
  Cart: "ShoppingCart",
  Warning: "AlertTriangle",
  Bin: "Trash2",
  Delete: "Trash2",
  Edit: "Pencil",
  SearchIcon: "Search",
  Sparkle: "Sparkles",
  Stars: "Sparkles",
  Chat: "MessageCircle",
  Chats: "MessageCircle",
  PhoneCall: "Phone",
  Email: "Mail",
};

export function detectDependencies(files = {}) {
  const deps = {
    "lucide-react": "^0.460.0",
  };

  const importRegex = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;

  Object.values(files).forEach((entry) => {
    const code = typeof entry === "string" ? entry : entry?.content || "";
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const pkg = match[1];
      if (!pkg.startsWith(".") && !pkg.startsWith("/") && pkg !== "react" && pkg !== "react-dom") {
        const pkgName = pkg.startsWith("@")
          ? pkg.split("/").slice(0, 2).join("/")
          : pkg.split("/")[0];
        deps[pkgName] = PINNED_DEPENDENCIES[pkgName] || "latest";
      }
    }
  });

  return deps;
}

export function sanitizeCodeForSandpack(code, filePath = "") {
  if (typeof code !== "string") return code;
  if (filePath.endsWith(".css")) return code;

  let fixed = code;

  // 1. Add missing React import if JSX is present
  if (!/import\s+React/.test(fixed) && /<[A-Za-z]/.test(fixed)) {
    fixed = `import React from "react";\n` + fixed;
  }

  // 2. Normalize .jsx imports to .js
  fixed = fixed.replace(/from\s+['"](\.[^'"]+)\.jsx['"]/g, 'from "$1.js"');

  // 3. Fix non-existent Lucide icons by aliasing them to guaranteed valid icons
  fixed = fixed.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g,
    (match, importsStr) => {
      const parts = importsStr.split(",").map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return p;

        // E.g. "Twitter" or "Twitter as CustomTwitter"
        const [originalName, alias] = trimmed.split(/\s+as\s+/).map((s) => s.trim());
        const replacement = LUCIDE_REPLACEMENTS[originalName];

        if (replacement) {
          const finalAlias = alias || originalName;
          return ` ${replacement} as ${finalAlias}`;
        }
        return p;
      });
      return `import {${parts.join(",")}} from "lucide-react"`;
    }
  );

  // 4. Ensure component file has a default export (fixes "Element type is invalid: expected a string... but got: undefined")
  const isComponentFile =
    filePath.includes("/components/") ||
    filePath.startsWith("components/") ||
    filePath === "/App.js" ||
    filePath === "App.js";

  if (isComponentFile) {
    const hasDefaultExport = /export\s+default\s+/.test(fixed);
    if (!hasDefaultExport) {
      // Find candidate component: function Name or const Name
      const compMatch = fixed.match(
        /(?:export\s+)?(?:function|const|let)\s+([A-Z][A-Za-z0-9_]*)\b/
      );
      if (compMatch) {
        const compName = compMatch[1];
        fixed += `\n\nexport default ${compName};\n`;
      }
    }
  }

  return fixed;
}

export function sanitizeSandpackFiles(files = {}) {
  const sanitized = {};
  for (const [path, content] of Object.entries(files)) {
    const code = typeof content === "string" ? content : content?.content || "";
    sanitized[path] = sanitizeCodeForSandpack(code, path);
  }
  return sanitized;
}