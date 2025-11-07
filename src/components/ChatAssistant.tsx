import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Eye, Bell, Loader2 } from "lucide-react";

interface ChatAssistantProps {
  selectedNodes: string[];
  expanded: boolean;
  onToggle: () => void;
  onShowNodes: (nodeIds: string[]) => void;
}

interface InsightCard {
  id: string;
  type: "pattern" | "opportunity" | "data" | "bottleneck";
  title: string;
  description: string;
  impact: string;
  priority: "high" | "medium" | "low";
  nodeIds: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// Typing speed configurations (ms per character)
const TYPING_SPEEDS = {
  instant: 0,      // No animation
  fast: 10,        // Very fast
  normal: 20,      // Normal speed
  slow: 40,        // Slower for dramatic effect
};

const ChatAssistant = ({ selectedNodes, onShowNodes }: ChatAssistantProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Good morning! I analyzed your team's data overnight and found some interesting patterns. Here are the top things you should know about today:",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTypingSpeed = TYPING_SPEEDS.normal; // Change this to adjust speed

  const insights: InsightCard[] = [
    {
      id: "1",
      type: "pattern",
      title: "Automation Failure Spike",
      description:
        "5 failures in last 48 hours with same error pattern: 'No keyword with name Setup C2 Environment found'",
      impact: "12 hours/month wasted",
      priority: "high",
      nodeIds: ["s1", "s2", "a1"],
    },
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "border-red-500 bg-red-50";
      case "opportunity":
        return "border-orange-500 bg-orange-50";
      case "data":
        return "border-green-500 bg-green-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const typeMessage = (fullText: string, messageId: number) => {
    // If instant typing, just set the full message
    if (currentTypingSpeed === 0) {
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === messageId
            ? { ...msg, content: fullText, isTyping: false }
            : msg
        )
      );
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === messageId
              ? { ...msg, content: fullText.slice(0, currentIndex) }
              : msg
          )
        );
        currentIndex++;
      } else {
        // Typing complete
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setIsTyping(false);
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === messageId ? { ...msg, isTyping: false } : msg
          )
        );
      }
    }, currentTypingSpeed);
  };

  const handleSend = async () => {
    if (!message.trim() || isTyping || isThinking) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsThinking(true);

    try {
      const context = selectedNodes.length ? selectedNodes.join(", ") : "No nodes selected";

      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, context }),
      });

      const data = await res.json();
      const fullResponse = data.reply || "No response from AI.";

      setIsThinking(false);
      setIsTyping(true);

      // Add empty AI message that will be typed into
      const aiMessageIndex = messages.length + 1; // +1 because we just added user message
      const aiResponse: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Start typing animation after a brief pause
      setTimeout(() => {
        typeMessage(fullResponse, aiMessageIndex);
      }, 400);

    } catch (err) {
      console.error("Error calling AI backend:", err);
      setIsThinking(false);
      setIsTyping(false);

      const errorResponse: Message = {
        role: "assistant",
        content: "⚠️ There was a problem contacting the AI server.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b-[3px] border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-pink" />
          <h3 className="font-extrabold text-lg">AI Assistant</h3>
          {insights.length > 0 && (
            <span className="w-5 h-5 bg-accent-pink text-xs font-bold rounded-full flex items-center justify-center border-2 border-border">
              {insights.length}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Messages Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="space-y-3">
          {/* Discovery Insights */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-accent-pink" />
              <span className="text-xs font-bold text-muted-foreground">TODAY'S INSIGHTS</span>
            </div>

            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`neo-card p-3 ${getInsightColor(insight.type)} border-l-4`}
              >
                <div className="mb-2">
                  <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs leading-relaxed mb-2">{insight.description}</p>
                  <p className="text-xs text-muted-foreground">💰 Impact: {insight.impact}</p>
                </div>
                <button
                  onClick={() => onShowNodes(insight.nodeIds)}
                  className="neo-button text-xs w-full flex items-center justify-center gap-2"
                >
                  <Eye className="w-3 h-3" />
                  Show Me in Graph
                </button>
              </div>
            ))}
          </div>

          {/* Chat Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${msg.role === "assistant"
                  ? "bg-muted border-2 border-border rounded-xl p-3 relative"
                  : "bg-secondary border-2 border-border rounded-xl p-3 ml-8"
                }`}
            >
              {msg.role === "assistant" && (
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent-pink border-2 border-border rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-foreground" />
                </div>
              )}
              <div className="flex items-start gap-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words flex-1">
                  {msg.content}
                  {msg.isTyping && (
                    <span className="inline-block w-0.5 h-4 bg-accent-pink ml-1 animate-pulse" />
                  )}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="bg-muted border-2 border-border rounded-xl p-3 relative">
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent-pink border-2 border-border rounded-full flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-foreground animate-spin" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-pulse">AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 p-4 border-t-[3px] border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isThinking
                ? "AI is thinking..."
                : isTyping
                  ? "AI is typing..."
                  : "Ask me anything..."
            }
            disabled={isTyping || isThinking}
            className="flex-1 px-4 py-2 bg-secondary border-2 border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-border disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isTyping || isThinking}
            className="neo-button flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed px-4"
          >
            {isThinking || isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Typing speed indicator (optional - can remove) */}
        {isTyping && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="w-1.5 h-1.5 bg-accent-pink rounded-full animate-pulse" />
            <span>Typing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;