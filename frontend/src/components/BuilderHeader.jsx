import { ArrowLeft, Code2, Download, Eye, Globe, Loader2 } from "lucide-react";

const BuilderHeader = ({
  projectName,
  version,
  showCode,
  publishing,
  onToggleShowCode,
  onOpenPreview,
  onPublish,
  onDownload,
  onBack,
  onLogout,
}) => {
  return (
    <header className="h-12 px-4 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <img src="/logo.svg" alt="logo" className="invert size-5" />
        <span className="text-sm font-medium text-zinc-950 truncate max-w-xs">
          {projectName}
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
          v{version}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleShowCode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer ${
            showCode ? "bg-zinc-950 text-white hover:bg-zinc-800" : "text-zinc-700"
          }`}
        >
          {showCode ? (
            <>
              <Eye size={13} />
              Preview
            </>
          ) : (
            <>
              <Code2 size={13} />
              Code
            </>
          )}
        </button>

        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer"
        >
          <Eye size={13} />
          Open Preview
        </button>

        <button
          onClick={onPublish}
          disabled={publishing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer"
        >
          {publishing ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
          Publish
        </button>

        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer"
        >
          <Download size={13} />
          Export
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </header>
  );
};

export default BuilderHeader;