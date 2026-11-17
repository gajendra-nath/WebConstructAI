import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import pMap from "p-map";
import {
  fileCodeSchema,
  filePlanSchema,
  revisionResultSchema,
} from "./aiSchemas.js";
import {
  buildFileCodeSystem,
  filePlanSystem,
  reviseSystem,
} from "./prompts.js";
import { normalizeContent } from "./contentNormalizer.js";
import {
  validateAndFixCode,
  validateRevisionContent,
} from "./codeValidator.js";

// OpenRouter model client setup
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY || "6", 10);

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = openrouter(MODEL);

// Generate a single file's code
async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
  const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
  const userMessage = `Project: ${prompt}\nWrite the complete code for ${file.path}\nPurpose: ${file.description}`;

  console.log(`[AI] Creating file ${file.path}...`);

  const { object } = await generateObject({
    model,
    schema: fileCodeSchema,
    system,
    prompt: userMessage,
    maxRetries: 2,
  });

  let code = normalizeContent(object.code);

  if (code.trim().length === 0) {
    throw new Error("Generated code is empty after normalization");
  }

  // Apply post-generation validation and auto-fix
  const validation = validateAndFixCode(code, file.path, {
    allPlannedFiles: allFiles,
  });
  code = validation.code;

  if (validation.warnings.length > 0) {
    console.log(
      `[Validator] Code adjustments for ${file.path}: ${validation.warnings.join(" - ")}`
    );
  }

  console.log(`[AI] Created file ${file.path} (${code.length} chars)`);
  return { path: file.path, code };
}

// Generate project files: Plan first, then build files in parallel with fallback retries
export async function generateProject(prompt, callbacks = {}) {
  // Phase 1: Plan
  console.log(`[AI Phase 1] Planning file structure for: "${prompt.slice(0, 80)}..."`);

  const { object: plan } = await generateObject({
    model,
    schema: filePlanSchema,
    system: filePlanSystem,
    prompt: `Plan a React website for: ${prompt}`,
    maxRetries: 2,
  });

  if (!plan.files.find((f) => f.path === "/App.js")) {
    plan.files.unshift({
      path: "/App.js",
      description: "Main application entry point",
      exports: "default App",
      imports: ["./styles.css"],
    });
  }

  if (!plan.files.find((f) => f.path === "/styles.css")) {
    plan.files.push({
      path: "/styles.css",
      description: "Global CSS, Google Font import, keyframe animations, utility classes",
      exports: "none",
      imports: [],
    });
  }

  if (callbacks.onPlan) {
    await callbacks.onPlan(plan);
  }

  // Phase 2: Generate files in parallel
  console.log(
    `[AI Phase 2] Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files
      .map((f) => f.path)
      .join(", ")}`
  );

  const files = {};
  let pendingFiles = plan.files.map((file) => ({ ...file }));
  const maxRetryRounds = 2;

  for (let round = 0; round <= maxRetryRounds; round++) {
    if (pendingFiles.length === 0) break;

    if (round > 0) {
      console.log(
        `[AI Retry] Round ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles
          .map((f) => f.path)
          .join(", ")}`
      );
    }

    const results = await pMap(
      pendingFiles,
      async (file) => {
        try {
          if (callbacks.onFileStart) {
            await callbacks.onFileStart(file.path);
          }

          const singleResult = await generateSingleFile(
            file,
            plan.files,
            prompt,
            files
          );

          if (callbacks.onFileComplete) {
            await callbacks.onFileComplete(file.path, singleResult.code);
          }

          return { success: true, file, result: singleResult };
        } catch (error) {
          return { success: false, file, error };
        }
      },
      { concurrency: MAX_CONCURRENCY }
    );

    const failedFiles = [];
    for (const entry of results) {
      if (entry.success) {
        const { path, code } = entry.result;
        files[path.startsWith("/") ? path : `/${path}`] = code;
      } else {
        console.warn(`[AI] Failed to generate ${entry.file.path}:`, entry.error?.message);
        failedFiles.push(entry.file);
      }
    }

    pendingFiles = failedFiles;
  }

  // Fallback placeholders for any remaining failed files
  if (pendingFiles.length > 0) {
    const failedPaths = pendingFiles.map((f) => f.path).join(", ");
    console.error(`[AI] Some files failed after retries: ${failedPaths}`);

    for (const file of pendingFiles) {
      if (file.path !== "/App.js") {
        const ext = file.path.split(".").pop()?.toLowerCase();
        if (ext === "css") {
          files[file.path] = `/* ${file.description} - generation failed, please retry */`;
        } else {
          files[file.path] =
            `import React from 'react';\n` +
            `// This file could not be generated. Please retry.\n` +
            `// Purpose: ${file.description}\n` +
            `export default function Placeholder() {\n` +
            `  return <div className="p-6 text-center text-zinc-400">Component failed to generate. Please try again.</div>;\n` +
            `}\n`;
        }
      }
    }
  }

  if (!files["/App.js"]) {
    throw new Error("AI did not generate /App.js entry point");
  }

  return {
    files,
    description: plan.projectDescription,
  };
}

// Revise existing project via follow-up chat prompt
export async function reviseProject(prompt, manifest, relevantFiles, recentMessages = []) {
  const contextParts = [];
  contextParts.push("Current project files manifest:");
  contextParts.push("---");
  for (const file of manifest) {
    contextParts.push(`${file.path} (hash: ${file.hash}, ${file.size} bytes)`);
  }
  contextParts.push("---");

  if (Object.keys(relevantFiles).length > 0) {
    contextParts.push("\nFile contents for reference:");
    for (const [path, content] of Object.entries(relevantFiles)) {
      contextParts.push(`\n--- ${path} ---\n${content}`);
    }
  }

  if (recentMessages.length > 0) {
    contextParts.push("\nRecent conversation history:");
    for (const msg of recentMessages.slice(-3)) {
      contextParts.push(`${msg.role}: ${msg.content}`);
    }
  }

  contextParts.push(`\nRevision requested:\n${prompt}`);

  console.log("[AI] Revising project...");

  const { object: rawParsed } = await generateObject({
    model,
    schema: revisionResultSchema,
    system: reviseSystem,
    prompt: contextParts.join("\n"),
    maxRetries: 2,
  });

  if (rawParsed && Array.isArray(rawParsed.operations)) {
    rawParsed.operations = rawParsed.operations.map((op) => {
      if (!op || typeof op !== "object") return op;

      let opStr = String(op.op || "").trim().toLowerCase();
      if (["create", "add", "new"].includes(opStr)) {
        op.op = "create";
      } else if (["update", "edit", "modify", "patch"].includes(opStr)) {
        op.op = "update";
      } else if (["delete", "remove", "del", "rm"].includes(opStr)) {
        op.op = "delete";
      }

      if (op.path && typeof op.path === "string" && !op.path.startsWith("/")) {
        op.path = `/${op.path}`;
      }

      if (op.content) op.content = normalizeContent(op.content);
      if (op.search) op.search = normalizeContent(op.search);
      if (op.replace) op.replace = normalizeContent(op.replace);

      if (op.op === "create" && op.content) {
        const validation = validateRevisionContent(op.content, op.path, "create");
        op.content = validation.content;
        if (validation.warnings.length > 0) {
          console.log(
            `[Validator] Revision create adjustments for ${op.path}: ${validation.warnings.join(" - ")}`
          );
        }
      } else if (op.op === "update" && op.replace) {
        const validation = validateRevisionContent(op.replace, op.path, "update");
        op.replace = validation.content;
        if (validation.warnings.length > 0) {
          console.log(
            `[Validator] Revision update adjustments for ${op.path}: ${validation.warnings.join(" - ")}`
          );
        }
      }

      return op;
    });
  }

  return rawParsed;
}