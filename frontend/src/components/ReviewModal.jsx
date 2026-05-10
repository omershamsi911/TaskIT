import { useState } from "react";
import { submitReview } from "../handlers/reviewHandlers"; // Assumes you made this handler

const T = { C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", LIGHT_IK: "#6B6B6B" };

const ReviewModal = ({ booking, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Send the review to backend. 
      // The backend should pass this comment to an LLM to generate trust score updates.
      await submitReview({
        booking_id: booking.id,
        rating,
        comment,
      });

      // Simulate AI analysis delay for UX effect
      setTimeout(() => {
        alert("Review submitted & analyzed successfully!");
        onClose();
      }, 1500);
      
    } catch (err) {
      alert("Failed to submit review");
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(26,26,26,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ background: T.CR, border: `1px solid ${T.IK}`, width: "100%", maxWidth: 500, position: "relative" }}>
        
        {/* Header */}
        <div style={{ background: T.IK, padding: "16px 24px", display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ color: T.CR, margin: 0, fontSize: "1.2rem", fontWeight: 900, textTransform: "uppercase" }}>
            RATE SERVICE
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.C, fontWeight: 900, cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Rating */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 12 }}>RATING (1-5)</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)}
                  style={{ flex: 1, padding: 12, background: rating >= star ? T.C : "transparent", border: `1px solid ${rating >= star ? T.C : T.IK}`, color: rating >= star ? T.CR : T.IK, fontWeight: 900, cursor: "pointer" }}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 8 }}>FEEDBACK</label>
            <textarea
              required
              rows={4}
              placeholder="Tell us about the quality of the service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", padding: 16, border: `1px solid ${T.IK}`, background: "#fff", outline: "none", resize: "none", fontFamily: "inherit", fontWeight: 700, boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 10, color: T.LIGHT_IK, margin: "8px 0 0 0", fontWeight: 700 }}>
              * Our AI analyzes feedback to ensure quality and provider reliability.
            </p>
          </div>

          <button type="submit" disabled={isProcessing}
            style={{ width: "100%", padding: "16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", background: isProcessing ? T.LIGHT_IK : T.IK, color: T.CR, border: "none", cursor: isProcessing ? "wait" : "pointer" }}
          >
            {isProcessing ? "AI ANALYZING REVIEW..." : "SUBMIT REVIEW →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;