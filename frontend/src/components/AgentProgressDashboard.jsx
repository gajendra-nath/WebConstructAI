import { CheckCircle2, FileCode, Loader2, Sparkles, XCircle } from "lucide-react";

const AgentProgressDashboard = ({ project }) => {
  const planned = project?.filesPlanned || [];
  const generated = project?.filesGenerated || [];
  const currentFile = project?.currentFile;
  const isFailed = project?.status === "failed";

  const total = planned.length;
  const completed = generated.length;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="h-full flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
            {isFailed ? (
              <XCircle size={20} className="text-red-400" />
            ) : (
              <Sparkles size={20} className="animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              {isFailed
                ? "Generation Failed"
                : total === 0
                ? "AI Agent is planning a structure..."
                : "AI Agent is building..."}
            </h2>
            <p className="text-xs text-zinc-500">
              {isFailed
                ? project?.error || "Something went wrong while generating files."
                : total === 0
                ? "Architecting components and production-ready React codebase"
                : `${completed} of ${total} files completed (${percent}%)`}
            </p>
          </div>
        </div>

        {total > 0 && (
          <>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-zinc-950 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {planned.map((file) => {
                const isDone = generated.includes(file.path);
                const isCurrent = currentFile === file.path;

                return (
                  <div
                    key={file.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                      isCurrent
                        ? "border-zinc-950 bg-zinc-50 font-medium text-zinc-950"
                        : isDone
                        ? "border-zinc-100 bg-white text-zinc-600"
                        : "border-zinc-100 bg-zinc-50/50 text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode size={14} className="shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 size={15} className="animate-spin text-zinc-950 shrink-0" />
                    ) : (
                      <span className="text-[11px] text-zinc-400">Queued</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentProgressDashboard;