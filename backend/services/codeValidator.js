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

export function fixLucideImports(code) {
  let replaced = false;
  const fixed = code.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g,
    (match, importsStr) => {
      const parts = importsStr.split(",").map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return p;

        const [originalName, alias] = trimmed.split(/\s+as\s+/).map((s) => s.trim());
        const replacement = LUCIDE_REPLACEMENTS[originalName];

        if (replacement) {
          replaced = true;
          const finalAlias = alias || originalName;
          return ` ${replacement} as ${finalAlias}`;
        }
        return p;
      });
      return `import {${parts.join(",")}} from "lucide-react"`;
    }
  );
  return { code: fixed, replaced };
}

export function validateAndFixCode(code, filePath, { allPlannedFiles = [] } = {}) {
  const warnings = [];
  let fixed = code;

  // Ensure React import is present in JS files if JSX is used
  if (filePath.endsWith(".js") || filePath.endsWith(".jsx")) {
    if (!/import\s+React/.test(fixed) && /<[A-Za-z]/.test(fixed)) {
      fixed = `import React from "react";\n` + fixed;
      warnings.push("Added missing React import");
    }

    // Normalize relative imports without extensions if planned file uses .js
    const plannedPaths = new Set(allPlannedFiles.map((f) => f.path));
    fixed = fixed.replace(/from\s+['"](\.[^'"]+)\.jsx['"]/g, (match, base) => {
      if (plannedPaths.has(`/${base.replace(/^\.\//, "")}.js`)) {
        warnings.push(`Normalized .jsx import to .js for ${base}`);
        return `from "${base}.js"`;
      }
      return match;
    });

    // Fix hallucinated Lucide icons
    const { code: fixedLucide, replaced } = fixLucideImports(fixed);
    if (replaced) {
      fixed = fixedLucide;
      warnings.push("Normalized unsupported Lucide icon imports to valid icons");
    }

    // Ensure component file has a default export
    const isComponent =
      filePath.includes("/components/") ||
      filePath.startsWith("components/") ||
      filePath === "/App.js" ||
      filePath === "App.js";

    if (isComponent && !/export\s+default\s+/.test(fixed)) {
      const compMatch = fixed.match(
        /(?:export\s+)?(?:function|const|let)\s+([A-Z][A-Za-z0-9_]*)\b/
      );
      if (compMatch) {
        fixed += `\n\nexport default ${compMatch[1]};\n`;
        warnings.push(`Added missing export default for ${compMatch[1]}`);
      }
    }
  }

  return { code: fixed, warnings };
}

export function validateRevisionContent(content, filePath, mode) {
  const warnings = [];
  let fixed = content;
  if ((filePath.endsWith(".js") || filePath.endsWith(".jsx")) && mode === "create") {
    if (!/import\s+React/.test(fixed) && /<[A-Za-z]/.test(fixed)) {
      fixed = `import React from "react";\n` + fixed;
      warnings.push("Added missing React import on create");
    }
  }

  const { code: fixedLucide, replaced } = fixLucideImports(fixed);
  if (replaced) {
    fixed = fixedLucide;
    warnings.push("Normalized unsupported Lucide icon imports");
  }

  return { content: fixed, warnings };
}
