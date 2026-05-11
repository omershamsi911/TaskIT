import { createContext, useContext, useState, useCallback, useEffect } from "react";

const NotificationContext = createContext();

const T = { C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", LIGHT_IK: "#6B6B6B" };

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = "info") => {
    setNotification({ message, type, id: Date.now() });
  }, []);

  const close = useCallback(() => setNotification(null), []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        close();
      }, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, close]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: "100%",
            maxWidth: 400,
            background: notification.type === "error" ? "#ea5455" : notification.type === "success" ? "#28c76f" : T.CR,
            border: `2px solid ${T.IK}`,
            boxShadow: `4px 4px 0px ${T.IK}`, // Brutalist hard shadow
            padding: 0,
            display: "flex",
            flexDirection: "column",
            animation: "slideUp 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `2px solid ${T.IK}`, background: T.IK }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: T.CR, textTransform: "uppercase" }}>
              SYSTEM {notification.type}
            </span>
            <button
              onClick={close}
              style={{ background: "transparent", border: "none", color: T.CR, cursor: "pointer", fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ padding: "16px", color: notification.type === "info" ? T.IK : T.CR, fontWeight: 700, fontSize: 14 }}>
            {notification.message}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);