import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import api from "../api/api";
import Loading from "../components/Loading";
import FullPagePreview from "../components/FullPagePreview";

const PublishPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPublicProject = async () => {
      try {
        const { data } = await api.get(`/api/projects/public/${id}`);
        setProject(data);
      } catch (err) {
        console.error("Failed to fetch public project:", err);
        setError(err.response?.data?.error || "This website is unavailable or not published.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProject();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error || !project) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-950 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h1 className="text-lg font-semibold mb-1">Website Unavailable</h1>
        <p className="text-xs text-zinc-500 max-w-sm mb-6">{error}</p>
        <div className="text-xs font-medium text-zinc-400">Web Construct</div>
      </div>
    );
  }

  return <FullPagePreview files={project.files} />;
};

export default PublishPage;