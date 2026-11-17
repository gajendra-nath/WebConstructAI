import { useMemo } from "react";
import { FileCode, FileText, Folder } from "lucide-react";

function getFileIcon(name) {
  if (name.endsWith(".css")) {
    return <FileText size={14} className="text-blue-500 shrink-0" />;
  }
  if (name.endsWith(".jsx") || name.endsWith(".js")) {
    return <FileCode size={14} className="text-amber-500 shrink-0" />;
  }
  if (name.endsWith(".json")) {
    return <FileText size={14} className="text-emerald-500 shrink-0" />;
  }
  return <FileText size={14} className="text-zinc-400 shrink-0" />;
}

function buildTree(paths) {
  const root = [];
  for (const filePath of paths.sort()) {
    const parts = filePath.split("/").filter(Boolean);
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const fullPath = "/" + parts.slice(0, i + 1).join("/");
      let existing = current.find((n) => n.name === name);
      if (!existing) {
        existing = {
          name,
          path: fullPath,
          isDirectory: !isLast,
          children: [],
        };
        current.push(existing);
      }
      current = existing.children;
    }
  }
  return root;
}

function TreeItem({ node, activeFile, onFileSelect, depth = 0 }) {
  const isActive = node.path === activeFile;

  if (node.isDirectory) {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1.5 px-2 text-xs font-medium text-zinc-600"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <Folder size={14} className="text-zinc-400 shrink-0" />
          <span>{node.name}</span>
        </div>
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileSelect(node.path)}
      className={`w-full flex items-center gap-2 py-1.5 px-2 text-xs rounded-md transition cursor-pointer ${
        isActive
          ? "bg-zinc-100 text-zinc-950 font-medium"
          : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

const FileExplorer = ({ files = {}, activeFile, onFileSelect }) => {
  const tree = useMemo(() => buildTree(Object.keys(files)), [files]);

  return (
    <div className="h-full overflow-y-auto p-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1.5">
        Files
      </p>
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          activeFile={activeFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
};

export default FileExplorer;