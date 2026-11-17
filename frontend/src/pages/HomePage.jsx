import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Trash2 } from "lucide-react";
import moment from "moment";
import { useAppContext } from "../context/AppContext";
import { homeTags } from "../assets/assets";
import PromptInput from "../components/PromptInput";

const HomePage = () => {
  const {
    user,
    projects,
    loadingProjects,
    generatingProject,
    loadProjects,
    handleGenerate,
    handleDelete,
    logout,
  } = useAppContext();

  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div
      className="min-h-screen overflow-y-auto text-white font-sans bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/bg-img.png')" }}
    >
      {/* Nav */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="logo" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">Web Construct</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-white/80">
          <span>{user?.name}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
        <div className="w-full flex flex-col items-center">
          {/* Promo badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs mb-6">
            <span className="px-2 py-0.5 rounded-full bg-white text-zinc-950 font-semibold text-[10px] uppercase">
              Promo
            </span>
            <span className="text-white/80">Create your first project for free</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-semibold text-center tracking-tight mb-3">
            Let&apos;s build your app together
          </h1>
          <p className="text-sm text-white/60 text-center max-w-lg mb-2">
            Describe any website or web app you want to create, and our AI agent will generate the complete React codebase.
          </p>

          {/* Prompt input with glassmorphic variant */}
          <div className="w-full mt-6">
            <PromptInput
              onSubmit={handleGenerate}
              loading={generatingProject}
              placeholder="Create a portfolio website..."
              variant="glass"
              autoFocus
            />
          </div>

          {/* Scrolling marquee tags */}
          <div className="w-full overflow-hidden mt-6">
            <div className="animate-marquee gap-3">
              {[...homeTags, ...homeTags].map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleGenerate(tag)}
                  disabled={generatingProject}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white/80 hover:text-white whitespace-nowrap transition cursor-pointer disabled:opacity-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* All projects */}
          {!loadingProjects && projects.length > 0 && (
            <div className="mt-12 w-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  All Projects
                </p>
                <span className="text-xs text-white/50">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/builder/${p._id}`)}
                    className="group flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {moment(p.updatedAt || p.createdAt).fromNow()}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                          v{p.version}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p._id);
                        }}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ArrowRight
                        size={14}
                        className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;  