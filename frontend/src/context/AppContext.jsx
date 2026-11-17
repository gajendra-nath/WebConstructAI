import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import api from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  // Auth states
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Project & Builder states
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [generatingProject, setGeneratingProject] = useState(false);
  const [activeFile, setActiveFile] = useState("/App.js");
  const [showCode, setShowCode] = useState(false);

  // Check user session on mount
  const checkSession = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Auth actions
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.error || "Invalid email or password";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password });
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      setProjects([]);
      setActiveProject(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  // Load all projects for logged-in user
  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load project list");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  // Load single project details
  const loadProject = useCallback(
    async (id, silent = false) => {
      if (!user) return;
      if (!silent) setLoadingActiveProject(true);
      try {
        const { data } = await api.get(`/api/projects/${id}`);
        setActiveProject(data);

        // Default file selection
        const files = Object.keys(data.files || {});
        if (files.length > 0) {
          setActiveFile((prev) => {
            if (files.includes(prev)) return prev;
            if (files.includes("/App.js")) return "/App.js";
            return files[0];
          });
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        if (!silent) {
          toast.error("Failed to load project");
          navigate("/");
        }
      } finally {
        if (!silent) setLoadingActiveProject(false);
      }
    },
    [user, navigate]
  );

  // Automatically poll active project status while AI is generating/revising
  useEffect(() => {
    if (!activeProject?._id || !user) return;

    const isOngoing =
      activeProject.status === "generating" ||
      activeProject.status === "pending" ||
      activeProject.status === "revising";

    if (isOngoing) {
      setChatLoading(true);
      const interval = setInterval(() => {
        loadProject(activeProject._id, true);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setChatLoading(false);
    }
  }, [activeProject?._id, activeProject?.status, loadProject, user]);

  // Create new project from prompt
  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) return;
      setGeneratingProject(true);
      try {
        const { data } = await api.post("/api/projects", { prompt });
        toast.success("AI agent is planning a structure...");
        navigate(`/builder/${data._id}`);
      } catch (error) {
        console.error("Generation error:", error);
        toast.error(error.response?.data?.error || "Failed to start generation");
      } finally {
        setGeneratingProject(false);
      }
    },
    [navigate, user]
  );

  // Delete project
  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await api.delete(`/api/projects/${id}`);
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete project");
      }
    },
    [user]
  );

  // Send follow-up AI modification prompt in chat
  const handleChat = useCallback(
    async (prompt) => {
      if (!activeProject || !user) return;
      setChatLoading(true);
      try {
        const { data } = await api.post(`/api/projects/${activeProject._id}/chat`, { prompt });
        setActiveProject(data);
        if (data.errors && data.errors.length > 0) {
          toast.error("Some edits could not be applied cleanly");
        } else {
          toast.success(`Updated to v${data.version}`);
        }
      } catch (error) {
        console.error("Chat error:", error);
        toast.error(error.response?.data?.error || "Failed to apply changes");
      } finally {
        setChatLoading(false);
      }
    },
    [activeProject, user]
  );

  // Debounced auto-save for manual code edits in Sandpack
  const debouncedSave = React.useMemo(
    () =>
      debounce(async (files, id) => {
        try {
          await api.put(`/api/projects/${id}/files`, { files });
        } catch (error) {
          console.error("Auto-save failed:", error);
          toast.error("Failed to auto-save changes");
        }
      }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  const updateProjectFiles = useCallback(
    (files) => {
      if (!activeProject || !user) return;
      debouncedSave(files, activeProject._id);
    },
    [activeProject, user, debouncedSave]
  );

  const value = {
    projects,
    loadingProjects,
    activeProject,
    loadingActiveProject,
    chatLoading,
    generatingProject,
    activeFile,
    showCode,
    user,
    loadingUser,
    setActiveFile,
    setShowCode,
    loadProjects,
    loadProject,
    handleGenerate,
    handleDelete,
    login,
    register,
    logout,
    updateProjectFiles,
    handleChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}