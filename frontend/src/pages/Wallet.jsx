import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import {
  getWalletBalance,
  getWalletTransactions,
  topUpWallet,
} from "../handlers/walletHandlers";
import { useNotify } from "../context/NotificationContext";
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Loader, Eye, EyeOff } from "lucide-react";

const TOPUP_PRESETS = [500, 1000, 2000, 5000];

const TXN_COLORS = {
  credit: { label: "CREDIT", bg: "#28c76f", color: "#fff" },
  debit: { label: "DEBIT", bg: "#ea5455", color: "#fff" },
  topup: { label: "TOP-UP", bg: T.IK, color: T.CR },
};

const WalletPage = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [topUpAmount, setTopUpAmount] = useState("");
  const [topping, setTopping] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const notify = useNotify();

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

  useEffect(() => {
    fetchAll();
  }, []);

  const handleTopUp = async (amount) => {
    const parsed = parseFloat(amount);

    if (!parsed || parsed <= 0) {
      return notify("Enter a valid amount.", "error");
    }

    if (parsed > 50000) {
      return notify("Maximum top-up is Rs. 50,000.", "error");
    }

    setTopping(true);

    try {
      const newBalance = await topUpWallet(parsed);

      setBalance(newBalance);

      setTopUpAmount("");
      setCardNumber("");
      setCardName("");
      setExpiry("");
      setCvv("");

      await fetchAll();
    } catch (err) {
      notify("Top-up failed. " + (err.response?.data?.detail || ""), "error");
    } finally {
      setTopping(false);
    }
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .substring(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value) => {
    value = value.replace(/\D/g, "").substring(0, 4);

    if (value.length >= 3) {
      return value.substring(0, 2) + "/" + value.substring(2);
    }

    return value;
  };

  const labelStyle = {
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: T.LIGHT_IK,
    display: "block",
    marginBottom: 6,
  };

  return (
    <SharedLayout>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: T.IK,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Wallet size={20} style={{ color: T.C }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: T.C,
            }}
          >
            MY WALLET
          </span>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: T.CR,
            padding: "4px 12px",
            background: T.C,
            color: T.CR,
            borderRadius: 2,
          }}
        >
          SECURE PAYMENTS
        </span>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 20px",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Loader size={40} style={{ color: T.C, animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>LOADING WALLET...</span>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* BALANCE */}
            <div
              style={{
                border: `1px solid ${T.IK}20`,
                marginBottom: 28,
                overflow: "hidden",
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  background: T.IK,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: T.C,
                  }}
                >
                  CURRENT BALANCE
                </span>

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.CR,
                    padding: "4px 12px",
                    background: T.C + "20",
                    borderRadius: 2,
                  }}
                >
                  WALLET
                </span>
              </div>

              <div
                style={{
                  padding: "32px 24px",
                  background: T.CR,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 900,
                      color: T.IK,
                      lineHeight: 1,
                      marginBottom: 8,
                    }}
                  >
                    {showBalance ? (
                      <>
                        Rs.{" "}
                        {Number(balance).toLocaleString("en-PK", {
                          minimumFractionDigits: 2,
                        })}
                      </>
                    ) : (
                      "••••••••"
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.LIGHT_IK,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    AVAILABLE BALANCE
                  </div>
                </div>

                <button
                  onClick={() => setShowBalance(!showBalance)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: T.LIGHT_IK,
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* TOPUP SECTION */}
            <div
              style={{
                border: `1px solid ${T.IK}20`,
                marginBottom: 28,
                overflow: "hidden",
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  background: T.IK,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CreditCard size={18} style={{ color: T.C }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: T.C,
                    }}
                  >
                    ADD FUNDS
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.CR,
                    padding: "4px 12px",
                    background: T.C + "20",
                    borderRadius: 2,
                  }}
                >
                  VISA / MASTERCARD
                </span>
              </div>

              <div
                style={{
                  background: T.CR,
                  padding: "24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 24,
                }}
              >
                {/* LEFT */}
                <div>
                  <label style={labelStyle}>Quick Amount</label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 10,
                      marginBottom: 24,
                    }}
                  >
                    {TOPUP_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTopUpAmount(amt)}
                        style={{
                          padding: "12px 14px",
                          border: `1px solid ${T.IK}20`,
                          background: "#fff",
                          fontSize: 10,
                          fontWeight: 800,
                          color: T.IK,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          borderRadius: 2,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = T.IK;
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.color = T.IK;
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Rs. {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <label style={labelStyle}>Amount</label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#fff",
                      border: `1px solid ${T.IK}20`,
                      marginBottom: 20,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 14px",
                        fontWeight: 900,
                        fontSize: 12,
                        color: T.IK,
                        borderRight: `1px solid ${T.IK}10`,
                      }}
                    >
                      Rs.
                    </div>

                    <input
                      type="number"
                      placeholder="0.00"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        padding: "14px",
                        fontSize: 14,
                        fontWeight: 700,
                        background: "transparent",
                      }}
                    />
                  </div>

                  <label style={labelStyle}>Card Number</label>

                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: `1px solid ${T.IK}20`,
                      background: "#fff",
                      outline: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 16,
                      borderRadius: 4,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.C}
                    onBlur={e => e.target.style.borderColor = `${T.IK}20`}
                  />

                  <label style={labelStyle}>Card Holder</label>

                  <input
                    type="text"
                    placeholder="JOHN DOE"
                    value={cardName}
                    onChange={(e) =>
                      setCardName(e.target.value.toUpperCase())
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: `1px solid ${T.IK}20`,
                      background: "#fff",
                      outline: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 16,
                      borderRadius: 4,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.C}
                    onBlur={e => e.target.style.borderColor = `${T.IK}20`}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 22,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Expiry</label>

                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: `1px solid ${T.IK}20`,
                          background: "#fff",
                          outline: "none",
                          fontSize: 13,
                          fontWeight: 700,
                          borderRadius: 4,
                          transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = T.C}
                        onBlur={e => e.target.style.borderColor = `${T.IK}20`}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>CVV</label>

                      <input
                        type="password"
                        placeholder="***"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(
                            e.target.value
                              .replace(/\D/g, "")
                              .substring(0, 3)
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: `1px solid ${T.IK}20`,
                          background: "#fff",
                          outline: "none",
                          fontSize: 13,
                          fontWeight: 700,
                          borderRadius: 4,
                          transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = T.C}
                        onBlur={e => e.target.style.borderColor = `${T.IK}20`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleTopUp(topUpAmount)}
                    disabled={
                      topping ||
                      !topUpAmount ||
                      !cardNumber ||
                      !cardName ||
                      !expiry ||
                      !cvv
                    }
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: "none",
                      background:
                        topping ||
                        !topUpAmount ||
                        !cardNumber ||
                        !cardName ||
                        !expiry ||
                        !cvv
                          ? T.LIGHT_IK
                          : T.C,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: topping ||
                        !topUpAmount ||
                        !cardNumber ||
                        !cardName ||
                        !expiry ||
                        !cvv ? "default" : "pointer",
                      borderRadius: 4,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: topping || !topUpAmount || !cardNumber || !cardName || !expiry || !cvv ? 0.6 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!topping && topUpAmount && cardNumber && cardName && expiry && cvv) {
                        e.currentTarget.style.opacity = "0.9";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = topping || !topUpAmount || !cardNumber || !cardName || !expiry || !cvv ? "0.6" : "1";
                    }}
                  >
                    {topping ? <><Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> PROCESSING...</> : "ADD FUNDS"}
                  </button>
                </div>

                {/* RIGHT CARD */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 320,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 400,
                      height: 240,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000 100%)",
                      padding: 24,
                      color: "#fff",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 24px 48px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1) inset",
                      perspective: "1000px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 240,
                        height: 240,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        top: -120,
                        right: -80,
                      }}
                    />

                    <div
                      style={{
                        width: 60,
                        height: 42,
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg,#d4af37,#f5d06f,#c79b2c)",
                        marginBottom: 32,
                      }}
                    />

                    <div
                      style={{
                        fontSize: 28,
                        letterSpacing: "0.12em",
                        fontWeight: 700,
                        marginBottom: 28,
                      }}
                    >
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.6,
                            marginBottom: 6,
                            textTransform: "uppercase",
                          }}
                        >
                          Card Holder
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {cardName || "YOUR NAME"}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.6,
                            marginBottom: 6,
                            textTransform: "uppercase",
                          }}
                        >
                          {/* Expires */}
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {/* {expiry || "MM/YY"} */}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        right: 28,
                        bottom: 24,
                        fontSize: 28,
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        opacity: 0.9,
                      }}
                    >
                      VISA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS */}
            <div style={{ border: `1px solid ${T.IK}20`, borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div
                style={{
                  padding: "14px 20px",
                  background: T.IK,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: T.C,
                  }}
                >
                  TRANSACTION HISTORY
                </span>

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.CR,
                    padding: "4px 12px",
                    background: T.C + "20",
                    borderRadius: 2,
                  }}
                >
                  HISTORY
                </span>
              </div>

              {transactions.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    background: T.CR,
                  }}
                >
                  <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 12 }}>📊</div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: T.IK,
                      margin: "0 0 6px",
                    }}
                  >
                    NO TRANSACTIONS YET
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      color: T.LIGHT_IK,
                      margin: 0,
                      fontFamily: "Georgia, serif",
                      fontWeight: 400,
                    }}
                  >
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div style={{ background: T.CR }}>
                  {transactions.map((txn, idx) => {
                    const meta =
                      TXN_COLORS[txn.type] || TXN_COLORS.topup;

                    const isDebit = txn.type === "debit";
                    const IconComp = isDebit ? ArrowDownLeft : ArrowUpRight;

                    return (
                      <div
                        key={txn.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "16px 20px",
                          borderBottom:
                            idx < transactions.length - 1
                              ? `1px solid ${T.IK}10`
                              : "none",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.IK + "05"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: meta.bg + "20",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: meta.bg,
                          }}
                        >
                          <IconComp size={16} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: T.IK,
                              marginBottom: 4,
                            }}
                          >
                            {txn.note || "Wallet Transaction"}
                          </div>

                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: T.LIGHT_IK,
                              letterSpacing: "0.05em",
                            }}
                          >
                            {new Date(txn.created_at).toLocaleString(
                              "en-PK",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: isDebit
                                ? "#ea5455"
                                : "#28c76f",
                              marginBottom: 2,
                            }}
                          >
                            {isDebit ? "−" : "+"} Rs.{" "}
                            {Number(txn.amount).toLocaleString(
                              "en-PK",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: 8,
                              fontWeight: 600,
                              color: T.LIGHT_IK,
                              letterSpacing: "0.05em",
                            }}
                          >
                            Bal:{" "}
                            {Number(
                              txn.balance_after
                            ).toLocaleString("en-PK", {
                              minimumFractionDigits: 0,
                            })}
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
