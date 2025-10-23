import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Sparkles } from "lucide-react";

interface ChatAssistantProps {
  selectedNodes: string[];
  expanded: boolean;
  onToggle: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatAssistant = ({ selectedNodes, expanded, onToggle }: ChatAssistantProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. I can help you discover patterns, analyze your selected data, and answer questions about the graph. Try selecting some nodes to get started!",
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    // Mock AI response
    const aiResponse: Message = {
      role: "assistant",
      content: `I analyzed your query: "${message}". Based on the ${selectedNodes.length} selected nodes, I found interesting patterns in your data. Would you like me to highlight related nodes or generate a detailed report?`,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, aiResponse]);
    setMessage("");
  };

  const suggestedQuestions = [
    "What caused these failures?",
    "Find similar patterns",
    "Compare with other teams",
    "Show me related TTPs",
  ];

  return (
    <div className={`neo-card flex flex-col transition-all duration-300 ${expanded ? "flex-1" : "h-16"}`}>
      {/* Header */}
      <div 
        className="p-4 border-b-[3px] border-border bg-muted/30 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-pink" />
          <h3 className="font-extrabold text-lg">AI Assistant</h3>
        </div>
        <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Chat Content */}
      {expanded && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${
                  msg.role === "assistant"
                    ? "bg-muted border-2 border-border rounded-xl p-3 relative"
                    : "bg-secondary border-2 border-border rounded-xl p-3 ml-8"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent-pink border-2 border-border rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-foreground" />
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessage(question)}
                      className="text-xs px-3 py-1.5 bg-secondary border-2 border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-[3px] border-border bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your data..."
                className="flex-1 px-4 py-2 bg-secondary border-2 border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-border"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="neo-button flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatAssistant;
