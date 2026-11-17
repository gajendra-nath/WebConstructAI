import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FolderTree, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import api from "../api/api";
import { exportProjectZip } from "../utils/exportProject";
import Loading from "../components/Loading";
import BuilderHeader from "../components/BuilderHeader";
import ChatPanel from "../components/ChatPanel";
import FileExplorer from "../components/FileExplorer";
import AgentProgressDashboard from "../components/AgentProgressDashboard";
import PreviewPanel from "../components/PreviewPanel";
import PublishModal from "../components/PublishModal";

const BuilderPage = () => {
  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    showCode,
    chatLoading,
    setActiveFile,
    setShowCode,
    loadProject,
    handleChat,
    logout,
  } = useAppContext();

  const { id } = useParams();
  const navigate = useNavigate();

  const [leftTab, setLeftTab] = useState("chat");
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadProject(id);
  }, [id]);

  const handleOpenPreview = () => {
    if (!id) return;
    window.open(`/preview/${id}`, "_blank");
  };

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      setPublishUrl(url);
      toast.success("Website published successfully!");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish website");
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = () => {
    if (!activeProject) return;
    exportProjectZip(activeProject);
  };

  if (loadingActiveProject || !activeProject) {
    return <Loading />;
  }

  return (
    <div className="h-screen flex flex-col bg-white text-zinc-950 relative">
      {/* Top bar / Header */}
      <BuilderHeader
        projectName={activeProject.name}
        version={activeProject.version}
        showCode={showCode}
        publishing={publishing}
        onToggleShowCode={() => setShowCode(!showCode)}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate("/")}
        onLogout={logout}
      />

      {/* Main layout */}
      <div className="flex overflow-hidden flex-1">
        {/* Left sidebar */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
          {/* Sidebar tabs */}
          <div className="flex border-b border-zinc-200">
            <button
              onClick={() => setLeftTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                leftTab === "chat"
                  ? "text-zinc-950 border-zinc-950"
                  : "text-zinc-400 border-transparent hover:text-zinc-700"
              }`}
            >
              <MessageSquare size={13} />
              Chat
            </button>
            <button
              onClick={() => setLeftTab("files")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                leftTab === "files"
                  ? "text-zinc-950 border-zinc-950"
                  : "text-zinc-400 border-transparent hover:text-zinc-700"
              }`}
            >
              <FolderTree size={13} />
              Files
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-hidden">
            {leftTab === "chat" ? (
              <ChatPanel
                messages={activeProject.messages}
                onSend={handleChat}
                loading={chatLoading}
              />
            ) : (
              <FileExplorer
                files={activeProject.files}
                activeFile={activeFile}
                onFileSelect={(path) => {
                  setActiveFile(path);
                  setShowCode(true);
                }}
              />
            )}
          </div>
        </div>

        {/* Preview / Code area */}
        <div className="flex-1 overflow-hidden">
          {activeProject.status === "pending" ||
          activeProject.status === "generating" ||
          activeProject.status === "failed" ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <PreviewPanel
              project={activeProject}
              activeFile={activeFile}
              showCode={showCode}
            />
          )}
        </div>
      </div>

      {publishUrl && (
        <PublishModal publishUrl={publishUrl} onClose={() => setPublishUrl(null)} />
      )}
    </div>
  );
};

export default BuilderPage;