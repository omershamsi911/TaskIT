/**
 * ChatPage.jsx
 * ─────────────────────────────────────────────────────────────────
 * Route: /chat  (room list) or /chat/:roomId  (open a specific room)
 *
 * Features:
 *  ✓ Real-time messaging via WebSocket
 *  ✓ Text messages
 *  ✓ Image sharing (preview inline)
 *  ✓ File attachments (PDF, doc, etc.)
 *  ✓ Voice messages (record + playback)
 *  ✓ Online presence indicators
 *  ✓ Unread badge in sidebar
 *  ✓ Infinite scroll / load older messages
 *  ✓ Matches the existing Taskit brutalist design system (T tokens)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import {
  getChatRooms,
  getRoomMessages,
  buildWsUrl,
} from "../handlers/chatHandlers";
import { useNotify } from "../context/NotificationContext";
import { Send, Paperclip, Mic, File, Image as ImageIcon, Download, ChevronDown, Menu, X, Loader } from "lucide-react";

// ─── UTILS ────────────────────────────────────────────────────────
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const diff  = Math.floor((today - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
};

const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ─── SIDEBAR ROOM ITEM ────────────────────────────────────────────
const RoomItem = ({ room, active, onClick }) => {
  const other = room.other_user;
  const last  = room.last_message;
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", border: "none", borderBottom: `1px solid ${T.IK}20`,
        background: active ? T.IK + "15" : hov ? T.IK + "08" : "transparent",
        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        transition: "all 0.15s", borderLeft: active ? `4px solid ${T.C}` : "4px solid transparent",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: active ? T.C : T.IK,
        color: active ? T.CR : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 900, position: "relative", transition: "all 0.15s",
      }}>
        {(other?.name || "?").charAt(0).toUpperCase()}
        {/* Online dot */}
        {room.online && (
          <span style={{
            position: "absolute", bottom: -2, right: -2,
            width: 12, height: 12, borderRadius: "50%",
            background: "#28c76f", border: `2.5px solid ${active ? T.IK + "15" : T.CR}`,
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: "0.08em", color: active ? T.C : T.IK,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {other?.name || "Unknown"}
          </span>
          {last && (
            <span style={{ fontSize: 8, fontWeight: 700, color: active ? T.LIGHT_IK : T.LIGHT_IK, flexShrink: 0 }}>
              {fmtTime(last.created_at)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 9, color: active ? T.LIGHT_IK : T.LIGHT_IK,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1,
          }}>
            {last ? last.content : "No messages yet"}
          </span>
          {room.unread_count > 0 && (
            <span style={{
              minWidth: 20, height: 20, borderRadius: 10, background: T.C,
              color: "#fff", fontSize: 8, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", flexShrink: 0,
            }}>
              {room.unread_count > 99 ? "99+" : room.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────
const Bubble = ({ msg, mine, prevSameSender }) => {
  const isText  = msg.message_type === "text";
  const isImage = msg.message_type === "image";
  const isVoice = msg.message_type === "voice";
  const isFile  = msg.message_type === "file";

  const content = msg.content || msg.attachment_url || "";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: mine ? "flex-end" : "flex-start",
      marginBottom: prevSameSender ? 4 : 14,
    }}>
      {!prevSameSender && (
        <span style={{
          fontSize: 8, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.1em", color: T.LIGHT_IK,
          marginBottom: 6, marginLeft: mine ? 0 : 2, marginRight: mine ? 2 : 0,
        }}>
          {mine ? "You" : msg.sender_name || "Provider"}
        </span>
      )}
      <div style={{
        maxWidth: "75%",
        background: mine ? T.IK : "#fff",
        color: mine ? T.CR : T.IK,
        border: mine ? "none" : `1px solid ${T.IK}`,
        padding: isImage ? 6 : "11px 15px",
        position: "relative",
        wordBreak: "break-word",
        borderRadius: mine ? "2px 8px 8px 2px" : "8px 2px 8px 2px",
        boxShadow: mine ? "0 2px 4px rgba(0,0,0,0.05)" : "0 1px 3px rgba(0,0,0,0.08)",
        transition: "all 0.2s",
      }}>
        {isText && (
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            {content}
          </p>
        )}
        {isImage && (
          <img
            src={content}
            alt="shared"
            style={{ maxWidth: "100%", maxHeight: 280, display: "block", cursor: "pointer" }}
            onClick={() => window.open(content, "_blank")}
          />
        )}
        {isVoice && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
            <Mic size={16} style={{ color: "inherit", flexShrink: 0 }} />
            <audio controls src={content} style={{ flex: 1, height: 28, borderRadius: 2 }} />
          </div>
        )}
        {isFile && (
          <a
            href={content}
            download={msg.filename || "attachment"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit", textDecoration: "none", padding: "4px 0" }}
          >
            <Download size={16} style={{ color: "inherit", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
              {msg.filename || "Download file"}
            </span>
          </a>
        )}
        {/* Timestamp */}
        <div style={{
          marginTop: isImage ? 4 : 5,
          textAlign: "right",
          fontSize: 9, fontWeight: 700,
          color: mine ? "rgba(245,240,230,0.5)" : T.LIGHT_IK,
          paddingRight: isImage ? 4 : 0,
          paddingBottom: isImage ? 2 : 0,
        }}>
          {fmtTime(msg.created_at)}
          {mine && (
            <span style={{ marginLeft: 4 }}>
              {msg.is_read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── VOICE RECORDER HOOK ─────────────────────────────────────────
const useVoiceRecorder = (onResult) => {
  const [recording, setRecording] = useState(false);
  const [duration,  setDuration]  = useState(0);
  const mediaRef   = useRef(null);
  const chunksRef  = useRef([]);
  const timerRef   = useRef(null);
  const notify = useNotify();

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const r    = new FileReader();
        r.onload   = () => onResult(r.result, duration);
        r.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setDuration(0);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      notify("Microphone access denied.", "error");
    }
  };

  const stop = () => {
    if (mediaRef.current) {
      mediaRef.current.stop();
      setRecording(false);
    }
  };

  return { recording, duration, start, stop };
};

// ─── CHAT WINDOW ──────────────────────────────────────────────────
const ChatWindow = ({ room, currentUser }) => {
  const [messages,     setMessages]     = useState([]);
  const [text,         setText]         = useState("");
  const [sending,      setSending]      = useState(false);
  const [loadingHist,  setLoadingHist]  = useState(true);
  const [otherOnline,  setOtherOnline]  = useState(room.online || false);
  const [hasMore,      setHasMore]      = useState(true);

  const wsRef      = useRef(null);
  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Load history
  useEffect(() => {
    setMessages([]);
    setLoadingHist(true);
    setHasMore(true);
    getRoomMessages(room.id, 50)
      .then(data => {
        setMessages(data);
        setHasMore(data.length === 50);
      })
      .catch(console.error)
      .finally(() => setLoadingHist(false));
  }, [room.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // WebSocket
  useEffect(() => {
    const ws = new WebSocket(buildWsUrl(room.id));
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const frame = JSON.parse(e.data);

      if (frame.type === "presence") {
        if (frame.user_id !== currentUser.id) {
          setOtherOnline(frame.status === "online");
        }
        return;
      }

      // Regular message — append if not already present (avoid duplicate on sender side)
      setMessages(prev => {
        if (prev.some(m => m.id === frame.id)) return prev;
        return [...prev, frame];
      });
    };

    ws.onerror = (e) => console.error("WS error", e);

    return () => { ws.close(); };
  }, [room.id, currentUser.id]);

  // Load older messages
  const loadOlder = async () => {
    if (!hasMore || messages.length === 0) return;
    const oldest = messages[0].id;
    const older  = await getRoomMessages(room.id, 50, oldest);
    setMessages(prev => [...older, ...prev]);
    setHasMore(older.length === 50);
  };

  // Send helpers
  const sendFrame = (frame) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(frame));
    }
  };

  const handleSendText = () => {
    if (!text.trim()) return;
    sendFrame({ type: "text", content: text.trim() });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const isImg   = file.type.startsWith("image/");
      sendFrame({
        type: isImg ? "image" : "file",
        content: dataUrl,
        filename: file.name,
      });
    } finally {
      setSending(false);
      e.target.value = "";
    }
  };

  const voiceRecorder = useVoiceRecorder((dataUrl, dur) => {
    sendFrame({ type: "voice", content: dataUrl, duration: dur });
  });

  // Group messages by date
  const grouped = [];
  let lastDate  = null;
  for (const msg of messages) {
    const d = fmtDate(msg.created_at);
    if (d !== lastDate) { grouped.push({ type: "divider", label: d }); lastDate = d; }
    grouped.push({ type: "msg", msg });
  }

  const other = room.other_user;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Chat header */}
      <div style={{
        padding: "0 20px", height: 60, display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: `1px solid ${T.IK}`,
        background: T.CR, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: T.IK,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, position: "relative",
          }}>
            {(other?.name || "?").charAt(0).toUpperCase()}
            {otherOnline && (
              <span style={{
                position: "absolute", bottom: -2, right: -2,
                width: 12, height: 12, borderRadius: "50%",
                background: "#28c76f", border: `2.5px solid ${T.CR}`,
              }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: T.IK }}>
              {other?.name || "User"}
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: otherOnline ? "#28c76f" : T.LIGHT_IK, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {otherOnline ? "● ONLINE" : "○ OFFLINE"}
            </div>
          </div>
        </div>
        <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, padding: "4px 12px", background: T.IK + "15", borderRadius: 2 }}>
          BOOKING #{room.booking_id}
        </span>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 20px",
        display: "flex", flexDirection: "column",
        background: T.CR_ALT,
      }}>
        {/* Load older */}
        {hasMore && !loadingHist && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={loadOlder}
              style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "transparent", border: `1px solid ${T.IK}`, color: T.IK, padding: "8px 16px", cursor: "pointer", borderRadius: 2, transition: "all 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
              ↑ LOAD OLDER
            </button>
          </div>
        )}

        {loadingHist ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Loader size={32} style={{ color: T.C, animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>LOADING MESSAGES...</span>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.6, gap: 12 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>💬</div>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK, margin: 0 }}>Start the conversation</p>
            <p style={{ fontSize: 9, color: T.LIGHT_IK, margin: 0 }}>Send a message to begin</p>
          </div>
        ) : (
          grouped.map((item, i) => {
            if (item.type === "divider") {
              return (
                <div key={`div-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", width: "100%" }}>
                  <div style={{ flex: 1, height: 1, background: T.IK, opacity: 0.1 }} />
                  <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK, whiteSpace: "nowrap" }}>{item.label}</span>
                  <div style={{ flex: 1, height: 1, background: T.IK, opacity: 0.1 }} />
                </div>
              );
            }
            const msg  = item.msg;
            const mine = msg.sender_id === currentUser.id;
            const prevItem = grouped[i - 1];
            const prevSame = prevItem?.type === "msg" && prevItem.msg.sender_id === msg.sender_id;
            return (
              <Bubble key={msg.id || `tmp-${i}`} msg={msg} mine={mine} prevSameSender={prevSame} />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Voice recording bar */}
      {voiceRecorder.recording && (
        <div style={{
          padding: "14px 20px", background: "#ea5455", borderTop: `2px solid #d13c3e`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <Mic size={16} style={{ color: "#fff", animation: "pulse 1s infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fff", flex: 1 }}>
            RECORDING — {voiceRecorder.duration}s
          </span>
          <button onClick={voiceRecorder.stop}
            style={{ padding: "8px 18px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "#fff", color: "#ea5455", border: "none", cursor: "pointer", borderRadius: 2, transition: "all 0.1s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            SEND
          </button>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        display: "flex", alignItems: "flex-end", borderTop: `1px solid ${T.IK}`,
        background: "#fff", flexShrink: 0, gap: 0, minHeight: 56,
      }}>
        {/* File button */}
        <input type="file" ref={fileRef} onChange={handleFileChange} style={{ display: "none" }} accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={sending}
          title="Attach file or image"
          style={{
            padding: "0 14px", border: "none", borderRight: `1px solid ${T.IK}`,
            background: "transparent", cursor: "pointer", color: T.IK,
            transition: "all 0.1s", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 56,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.IK + "10"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Paperclip size={18} />
        </button>

        {/* Voice button */}
        <button
          onClick={voiceRecorder.recording ? voiceRecorder.stop : voiceRecorder.start}
          title={voiceRecorder.recording ? "Stop recording" : "Record voice message"}
          style={{
            padding: "0 14px", border: "none", borderRight: `1px solid ${T.IK}`,
            background: voiceRecorder.recording ? "#ea5455" : "transparent",
            cursor: "pointer",
            color: voiceRecorder.recording ? "#fff" : T.IK,
            transition: "all 0.1s", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 56,
          }}
        >
          <Mic size={18} />
        </button>

        {/* Text input */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          style={{
            flex: 1, resize: "none", border: "none", outline: "none",
            padding: "14px 16px", fontSize: 10, fontWeight: 500,
            letterSpacing: "0.04em", background: "transparent",
            color: T.IK, fontFamily: "inherit", lineHeight: 1.5, minHeight: 56,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSendText}
          disabled={!text.trim()}
          style={{
            padding: "0 16px", border: "none", borderLeft: `1px solid ${T.IK}`,
            background: text.trim() ? T.C : "transparent",
            color: text.trim() ? "#fff" : T.LIGHT_IK,
            cursor: text.trim() ? "pointer" : "default",
            fontSize: 10, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: "0.1em", transition: "all 0.15s", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 56,
          }}
          onMouseEnter={e => { if (text.trim()) e.currentTarget.style.background = T.IK; }}
          onMouseLeave={e => { if (text.trim()) e.currentTarget.style.background = T.C; }}
        >
          <span style={{ display: "inline" }}>SEND</span>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── CHAT PAGE ────────────────────────────────────────────────────
const ChatPage = () => {
  const { roomId }    = useParams();             // optional route param
  const navigate      = useNavigate();
  const [rooms,       setRooms]       = useState([]);
  const [activeRoom,  setActiveRoom]  = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Read current user from localStorage
  const userStr    = localStorage.getItem("user");
  const currentUser = userStr
    ? (() => { try { return JSON.parse(userStr); } catch { return null; } })()
    : null;

  // Redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem("access_token")) navigate("/login");
  }, [navigate]);

  // Load rooms
  const loadRooms = useCallback(async () => {
    try {
      const data = await getChatRooms();
      setRooms(data);
      // Auto-select by URL param or first room
      if (roomId) {
        const found = data.find(r => String(r.id) === String(roomId));
        setActiveRoom(found || data[0] || null);
      } else if (!activeRoom) {
        setActiveRoom(data[0] || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  }, [roomId]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  // Poll for new rooms / unread counts every 15s
  useEffect(() => {
    const id = setInterval(loadRooms, 15000);
    return () => clearInterval(id);
  }, [loadRooms]);

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unread_count || 0), 0);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SharedLayout>
      {/* Page header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 20px", background: T.IK, borderBottom: `1px solid ${T.IK}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>MESSAGES</span>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.CR, padding: "4px 12px", background: T.C, color: T.CR, borderRadius: 2 }}>
          {totalUnread > 0 ? `${totalUnread} UNREAD` : "ALL CAUGHT UP"}
        </span>
      </div>

      {/* Main layout */}
      <div style={{
        display: "flex", height: "calc(100vh - 170px)",
        borderBottom: `1px solid ${T.IK}`,
        "@media (max-width: 768px)": { height: "calc(100vh - 130px)" },
      }}>
        {/* ── Sidebar ─────────────────────────── */}
        <div style={{
          width: sidebarOpen ? 320 : 0, flexShrink: 0, borderRight: `1px solid ${T.IK}`,
          overflowY: "auto", background: T.CR, transition: "width 0.3s", overflow: "hidden",
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: "14px 20px", borderBottom: `1px solid ${T.IK}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>
              CONVERSATIONS
            </span>
            <span style={{ fontSize: 9, fontWeight: 900, color: T.C }}>{rooms.length}</span>
          </div>

          {loadingRooms ? (
            <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: T.LIGHT_IK }}>
              LOADING...
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: 0 }}>
                No conversations yet.
              </p>
              <p style={{ fontSize: 9, color: T.LIGHT_IK, margin: "8px 0 0", lineHeight: 1.6 }}>
                Open a booking and tap "Chat" to start.
              </p>
            </div>
          ) : (
            rooms.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                active={activeRoom?.id === room.id}
                onClick={() => {
                  setActiveRoom(room);
                  navigate(`/chat/${room.id}`, { replace: true });
                }}
              />
            ))
          )}
        </div>

        {/* ── Chat window ─────────────────────── */}
        {activeRoom ? (
          <ChatWindow
            key={activeRoom.id}
            room={activeRoom}
            currentUser={currentUser}
          />
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: T.CR_ALT, gap: 14, padding: "20px",
          }}>
            <div style={{ fontSize: 60, opacity: 0.2 }}>💬</div>
            <div style={{ textAlign: "center", maxWidth: 320 }}>
              <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.IK, margin: "0 0 8px" }}>
                SELECT A CONVERSATION
              </p>
              <p style={{ fontSize: 10, color: T.LIGHT_IK, margin: 0, lineHeight: 1.6 }}>
                Open a booking to start messaging with a provider
              </p>
            </div>
            <Link to="/my-bookings"
              style={{
                marginTop: 8, padding: "12px 24px", fontSize: 10, fontWeight: 900,
                textTransform: "uppercase", letterSpacing: "0.12em",
                background: T.C, color: "#fff", textDecoration: "none", borderRadius: 2, transition: "all 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              VIEW MY BOOKINGS
            </Link>
          </div>
        )}
      </div>
    </SharedLayout>
  );
};

export default ChatPage;
