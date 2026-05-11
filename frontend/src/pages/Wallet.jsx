import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getWalletBalance, getWalletTransactions, topUpWallet } from "../handlers/walletHandlers";

const TOPUP_PRESETS = [500, 1000, 2000, 5000];

const TXN_COLORS = {
  credit: { label: "CREDIT",  bg: "#28c76f", color: "#fff" },
  debit:  { label: "DEBIT",   bg: "#ea5455", color: "#fff" },
  topup:  { label: "TOP-UP",  bg: T.IK,      color: T.CR  },
};

const WalletPage = () => {
  const [balance,      setBalance]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [topUpAmount,  setTopUpAmount]  = useState("");
  const [topping,      setTopping]      = useState(false);

  const fetchAll = async () => {
    try {
      const [bal, txns] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(),
      ]);
      setBalance(bal);
      setTransactions(txns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleTopUp = async (amount) => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return alert("Enter a valid amount.");
    if (parsed > 50000) return alert("Maximum top-up is Rs. 50,000.");
    setTopping(true);
    try {
      const newBalance = await topUpWallet(parsed);
      setBalance(newBalance);
      setTopUpAmount("");
      await fetchAll();
    } catch (err) {
      alert("Top-up failed. " + (err.response?.data?.detail || ""));
    } finally {
      setTopping(false);
    }
  };

  const labelStyle = {
    fontSize: 9, fontWeight: 900, textTransform: "uppercase",
    letterSpacing: "0.15em", color: T.LIGHT_IK, display: "block", marginBottom: 6,
  };

  return (
    <SharedLayout>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>
          MY WALLET
        </span>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR, opacity: 0.4 }}>
          SIMULATED · REAL PAYMENTS COMING SOON
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>
            LOADING...
          </div>
        ) : (
          <>
            {/* ── Balance Card ───────────────────────────────────── */}
            <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32 }}>
              <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>
                  CURRENT BALANCE
                </span>
                <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 001</span>
              </div>
              <div style={{ padding: "32px 24px", background: T.CR, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: T.IK, lineHeight: 1 }}>
                    Rs. {Number(balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK, marginTop: 6, letterSpacing: "0.1em" }}>
                    AVAILABLE FOR BOOKINGS
                  </div>
                </div>
              </div>
            </div>

            {/* ── Top-Up Card ────────────────────────────────────── */}
            <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32 }}>
              <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>
                  ADD FUNDS
                </span>
                <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 002</span>
              </div>
              <div style={{ padding: "24px", background: T.CR }}>
                {/* Quick preset buttons */}
                <label style={labelStyle}>Quick Select</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                  {TOPUP_PRESETS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleTopUp(amt)}
                      disabled={topping}
                      style={{
                        padding: "10px 20px", fontSize: 10, fontWeight: 900,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        border: `1px solid ${T.IK}`, background: "transparent",
                        color: T.IK, cursor: topping ? "not-allowed" : "pointer",
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}
                    >
                      + Rs. {amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <label style={labelStyle}>Custom Amount</label>
                <div style={{ display: "flex", gap: 0 }}>
                  <div style={{ padding: "14px 16px", background: T.IK, color: T.CR, fontSize: 11, fontWeight: 900 }}>
                    Rs.
                  </div>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    min="1"
                    max="50000"
                    style={{
                      flex: 1, padding: "14px 16px", fontSize: 11, fontWeight: 700,
                      border: `1px solid ${T.IK}`, borderLeft: "none", outline: "none",
                      background: "#fff", color: T.IK,
                    }}
                  />
                  <button
                    onClick={() => handleTopUp(topUpAmount)}
                    disabled={topping || !topUpAmount}
                    style={{
                      padding: "14px 24px", fontSize: 10, fontWeight: 900,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      background: topping || !topUpAmount ? T.LIGHT_IK : T.C,
                      color: T.CR, border: "none",
                      cursor: topping || !topUpAmount ? "not-allowed" : "pointer",
                      transition: "all 0.1s",
                    }}
                  >
                    {topping ? "..." : "ADD →"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Transaction History ─────────────────────────────── */}
            <div style={{ border: `1px solid ${T.IK}` }}>
              <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>
                  TRANSACTION HISTORY
                </span>
                <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 003</span>
              </div>

              {transactions.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", background: T.CR }}>
                  <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: 0 }}>
                    NO TRANSACTIONS YET
                  </p>
                </div>
              ) : (
                <div style={{ background: T.CR }}>
                  {transactions.map((txn, idx) => {
                    const meta = TXN_COLORS[txn.type] || TXN_COLORS.topup;
                    const isDebit = txn.type === "debit";
                    return (
                      <div
                        key={txn.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 16,
                          padding: "16px 24px",
                          borderBottom: idx < transactions.length - 1 ? `1px solid ${T.IK}20` : "none",
                        }}
                      >
                        {/* Type badge */}
                        <div style={{
                          padding: "4px 10px", fontSize: 8, fontWeight: 900,
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          background: meta.bg, color: meta.color,
                          flexShrink: 0, minWidth: 64, textAlign: "center",
                        }}>
                          {meta.label}
                        </div>

                        {/* Note */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.IK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {txn.note || "—"}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: T.LIGHT_IK, marginTop: 3, letterSpacing: "0.08em" }}>
                            {new Date(txn.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>

                        {/* Amount */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: isDebit ? "#ea5455" : "#28c76f" }}>
                            {isDebit ? "−" : "+"} Rs. {Number(txn.amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: T.LIGHT_IK, marginTop: 2 }}>
                            Bal: Rs. {Number(txn.balance_after).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SharedLayout>
  );
};

export default WalletPage;