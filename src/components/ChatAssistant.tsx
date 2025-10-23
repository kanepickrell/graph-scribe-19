import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Sparkles, Eye, Bell, AlertCircle, Database, Zap } from "lucide-react";

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
}

const ChatAssistant = ({ selectedNodes, expanded, onToggle, onShowNodes }: ChatAssistantProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Good morning! I analyzed your team's data overnight and found some interesting patterns. Here are the top things you should know about today:",
      timestamp: new Date(),
    },
  ]);

  const insights: InsightCard[] = [
    {
      id: "1",
      type: "pattern",
      title: "Automation Failure Spike",
      description: "5 failures in last 48 hours with same error pattern: 'No keyword with name Setup C2 Environment found'",
      impact: "12 hours/month wasted",
      priority: "high",
      nodeIds: ["s1", "s2", "a1"]
    },
    {
      id: "2",
      type: "opportunity",
      title: "Cross-Team Collaboration",
      description: "Blue Team solved 'C2 download refactor' 2 weeks ago. Red Team is working on the same thing now.",
      impact: "Share knowledge, save 8 hours",
      priority: "medium",
      nodeIds: ["p1", "s1", "s2"]
    },
    {
      id: "3",
      type: "data",
      title: "ML Training Data Ready",
      description: "47 complete C2 execution logs from Q3 2025. High quality, consistent format.",
      impact: "Perfect for command prediction models",
      priority: "low",
      nodeIds: ["a1", "a2", "a3"]
    }
  ];

  const getInsightIcon = (type: string) => {
    switch(type) {
      case "pattern": return <AlertCircle className="w-4 h-4" />;
      case "opportunity": return <Zap className="w-4 h-4" />;
      case "data": return <Database className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch(type) {
      case "pattern": return "border-red-500 bg-red-50";
      case "opportunity": return "border-orange-500 bg-orange-50";
      case "data": return "border-green-500 bg-green-50";
      default: return "border-blue-500 bg-blue-50";
    }
  };

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
        <div className="flex items-center gap-2 relative">
          <Sparkles className="w-5 h-5 text-accent-pink" />
          <h3 className="font-extrabold text-lg">AI Discovery Assistant</h3>
          {insights.length > 0 && (
            <span className="ml-2 w-5 h-5 bg-accent-pink text-xs font-bold rounded-full flex items-center justify-center border-2 border-border">
              {insights.length}
            </span>
          )}
        </div>
        <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Chat Content */}
      {expanded && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Discovery Insights Section */}
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
                  <div className="flex items-start gap-2 mb-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs leading-relaxed mb-2">{insight.description}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        💰 Impact: {insight.impact}
                      </p>
                    </div>
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
