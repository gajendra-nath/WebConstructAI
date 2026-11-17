import { X } from "lucide-react";
import toast from "react-hot-toast";

const PublishModal = ({ publishUrl, onClose }) => {
  const handleCopyLink = () => {
    if (!publishUrl) return;
    navigator.clipboard.writeText(publishUrl);
    toast.success("Public link copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-950 transition cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-950">Your website is live!</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Anyone with this link can view your published website without logging in.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1.5">
              Published Link
            </label>
            <input
              type="text"
              readOnly
              value={publishUrl}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              Copy Link
            </button>
            <button
              onClick={() => window.open(publishUrl, "_blank")}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              Open Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;  