// src/components/AISupport.jsx
import { useState, useRef, useEffect } from "react";
import { sendToAISupport, checkAIHealth } from "../handlers/aiHandlers";

// ── Design tokens ─────────────────────────────────────────────────
const T = {
  C:        "#FF5733",
  CR:       "#F5F0E6",
  IK:       "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
};

const SOURCE_LABELS = {
  ai:    { label: "AI ASSISTANT",   color: T.C        },
  kb:    { label: "KNOWLEDGE BASE", color: "#28c76f"  },
  human: { label: "HUMAN SUPPORT",  color: T.LIGHT_IK },
};

// ── Main component ────────────────────────────────────────────────
const AISupport = () => {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role:   "assistant",
      text:   "Hi! I'm Taskit's AI support assistant. Ask me anything about bookings, services, or your account.",
      source: "ai",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const bottomRef = useRef(null);

  // Check AI health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkAIHealth();
      setAiAvailable(health.ai_available);
      if (!health.ai_available) {
        console.warn("[AISupport] AI service not available, falling back to KB only");
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // Call AI handler
      const response = await sendToAISupport(text);
      
      setMessages(prev => [...prev, {
        role: "assistant",
        text: response.text,
        source: response.source,
      }]);
      
      // Handle escalation if needed
      if (response.needsEscalation) {
        console.log("[AISupport] Human escalation needed for query:", text);
        // You can add additional logic here, like showing a contact form
      }
      
    } catch (err) {
      console.error("[AISupport] Error:", err);
      
      // Show error message to user
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: err.message || "Something went wrong. Please try again in a moment or contact us directly at support@taskit.pk",
          source: "human",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Chat cleared! How can I help you today?",
        source: "ai",
      },
    ]);
  };

  return (
    <>
      {/* ── AI Support Panel ─────────────────────────────────────────── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 9999,
          width: 360, maxHeight: 520,
          background: T.CR, border: `1px solid ${T.IK}`,
          display: "flex", flexDirection: "column",
          boxShadow: "4px 4px 0px #1A1A1A",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background: T.IK, padding: "14px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: T.C }}>
                TASKIT AI SUPPORT
              </span>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: T.CR, opacity: 0.5, marginTop: 2 }}>
                {aiAvailable ? "AI · KNOWLEDGE BASE · HUMAN" : "KNOWLEDGE BASE · HUMAN"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={clearChat}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: T.CR, 
                  fontWeight: 700, 
                  fontSize: 12, 
                  cursor: "pointer",
                  opacity: 0.7
                }}
                title="Clear chat"
              >
                ⌫
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "transparent", border: "none", color: T.C, fontWeight: 900, fontSize: 16, cursor: "pointer", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px",
            display: "flex", flexDirection: "column", gap: 12,
            minHeight: 0, maxHeight: 340,
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: "flex", flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px",
                  background: msg.role === "user" ? T.IK : "#fff",
                  color: msg.role === "user" ? T.CR : T.IK,
                  border: `1px solid ${T.IK}`,
                  fontSize: 12, fontWeight: 600, lineHeight: 1.6,
                }}>
                  {msg.text}
                </div>
                {msg.role === "assistant" && msg.source && (
                  <span style={{
                    fontSize: 8, fontWeight: 900, letterSpacing: "0.12em",
                    textTransform: "uppercase", marginTop: 4,
                    color: SOURCE_LABELS[msg.source]?.color || T.LIGHT_IK,
                  }}>
                    {SOURCE_LABELS[msg.source]?.label}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{
                  padding: "10px 14px", background: "#fff",
                  border: `1px solid ${T.IK}`,
                  fontSize: 12, color: T.LIGHT_IK, fontWeight: 700, letterSpacing: "0.05em",
                }}>
                  AI IS THINKING...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: `1px solid ${T.IK}`, display: "flex" }}>
            <textarea
              rows={2}
              placeholder="Ask me anything about Taskit..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1, padding: "12px 16px", fontSize: 11, fontWeight: 600,
                border: "none", outline: "none", resize: "none",
                background: "#fff", fontFamily: "inherit", color: T.IK,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 52,
                background: input.trim() && !loading ? T.IK : T.LIGHT_IK,
                border: "none", borderLeft: `1px solid ${T.IK}`,
                color: T.CR, fontWeight: 900, fontSize: 16,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 0.1s",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Bubble ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56,
          background: open ? T.LIGHT_IK : T.IK,
          border: `2px solid ${T.C}`,
          color: T.CR, fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "3px 3px 0px #FF5733",
          transition: "all 0.15s",
        }}
        title="Taskit AI Support"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
};

export default AISupport;