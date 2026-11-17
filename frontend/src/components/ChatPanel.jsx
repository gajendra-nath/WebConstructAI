import { useEffect, useRef } from "react";
import { Bot, BotMessageSquare, User } from "lucide-react";
import PromptInput from "./PromptInput";

const ChatPanel = ({ messages = [], onSend, loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, loading]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-zinc-400">Ask AI to modify your website...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
              {msg.role === "user" ? (
                <User size={14} className="text-zinc-500" />
              ) : (
                <BotMessageSquare size={14} className="text-zinc-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-zinc-400 mb-0.5">
                {msg.role === "user" ? "You" : "AI"}
              </p>
              <p className="text-xs text-zinc-700 leading-relaxed break-words">
                {msg.content.split("- ").map((text, index) => (
                  <span key={index} className="block mt-1">
                    <span className={index === 0 ? "hidden" : ""}>- </span>
                    {text}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={13} className="text-zinc-900" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-zinc-400 mb-0.5">AI</p>
              <div className="dot-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-200">
        <PromptInput
          onSubmit={onSend}
          loading={loading}
          placeholder="Ask AI to modify..."
          autoFocus
        />
      </div>
    </div>
  );
};

export default ChatPanel;