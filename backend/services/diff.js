import crypto from "crypto";

function hashContent(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

export function applyOperations(existingFiles = {}, operations = []) {
  const files = { ...existingFiles };
  const applied = [];
  const errors = [];

  for (const op of operations) {
    const path = op.path?.startsWith("/") ? op.path : `/${op.path}`;

    try {
      if (op.op === "create") {
        if (!op.content) throw new Error(`Missing content for create ${path}`);
        files[path] = {
          content: op.content,
          hash: hashContent(op.content),
        };
        applied.push({ op: "create", path });
      } else if (op.op === "delete") {
        delete files[path];
        applied.push({ op: "delete", path });
      } else if (op.op === "update") {
        const currentEntry = files[path];
        if (!currentEntry) throw new Error(`File not found for update: ${path}`);

        const currentCode =
          typeof currentEntry === "string" ? currentEntry : currentEntry.content;

        if (op.search && op.replace !== undefined && op.replace !== null) {
          if (!currentCode.includes(op.search)) {
            throw new Error(`Search block not found in ${path}`);
          }
          const updatedCode = currentCode.replace(op.search, op.replace);
          files[path] = {
            content: updatedCode,
            hash: hashContent(updatedCode),
          };
          applied.push({ op: "update", path });
        } else if (op.content) {
          files[path] = {
            content: op.content,
            hash: hashContent(op.content),
          };
          applied.push({ op: "update", path });
        } else {
          throw new Error(`Invalid update payload for ${path}`);
        }
      }
    } catch (err) {
      errors.push({ path, error: err.message });
    }
  }

  return { files, applied, errors };
}