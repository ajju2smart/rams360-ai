import React, { useState, useRef, useEffect } from "react";
import Api from "../../Api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faTimes,
  faPaperPlane,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import "./Chatbot.css";

const WELCOME = "Hello! I'm RAMS360 AI Assistant. Ask me anything about Reliability, FMECA, MTTR, Safety, or any RAMS engineering topic.";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const buildHistory = () =>
    messages
      .filter((m) => m.role !== "assistant" || m.text !== WELCOME)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await Api.post("/api/v1/chatbot/ask", {
        message: trimmed,
        history: buildHistory(),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data?.data?.reply || "No response." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ AI service is temporarily unavailable. Please try again shortly.",
          error: true,
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

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="chatbot-fab"
        onClick={() => setOpen((v) => !v)}
        title="RAMS360 AI Assistant"
        aria-label="Open AI Assistant"
      >
        <FontAwesomeIcon icon={open ? faTimes : faCommentDots} size="lg" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <FontAwesomeIcon icon={faRobot} style={{ marginRight: 8 }} />
            <span>RAMS360 AI Assistant</span>
            <button
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg chatbot-msg--${msg.role}${msg.error ? " chatbot-msg--error" : ""}`}
              >
                <span className="chatbot-msg-text">{msg.text}</span>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant chatbot-msg--typing">
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ask a RAMS question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
