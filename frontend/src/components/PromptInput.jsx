import { useEffect, useRef, useState } from "react";
import { ArrowRight, CloudUpload, Loader2, Mic } from "lucide-react";

const PromptInput = ({
  onSubmit,
  loading = false,
  placeholder,
  large = false,
  autoFocus = false,
  variant = "default",
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (variant === "glass") {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl transition focus-within:border-white/40"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          rows={3}
          className="w-full bg-transparent text-white placeholder-white/50 text-sm resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <label
            htmlFor="file"
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <input type="file" id="file" hidden />
            <CloudUpload size={18} />
          </label>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <Mic size={18} />
            </button>
            <button
              type="submit"
              disabled={!value.trim() || loading}
              className="p-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-40 transition cursor-pointer"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 focus-within:border-zinc-400 focus-within:bg-white transition ${
        large ? "p-4" : "p-3"
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        rows={large ? 5 : 1}
        className={`w-full bg-transparent text-zinc-900 placeholder-zinc-400 resize-none focus:outline-none ${
          large ? "text-base" : "text-sm"
        }`}
      />
      <button
        onClick={() => handleSubmit()}
        disabled={!value.trim() || loading}
        className="shrink-0 rounded-lg bg-zinc-950 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
        style={{ width: large ? 36 : 24, height: large ? 36 : 24 }}
      >
        {loading ? (
          <Loader2 size={large ? 20 : 15} className="animate-spin" />
        ) : (
          <ArrowRight size={large ? 20 : 15} />
        )}
      </button>
    </div>
  );
};

export default PromptInput;