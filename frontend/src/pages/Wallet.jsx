import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import {
  getWalletBalance,
  getWalletTransactions,
  topUpWallet,
} from "../handlers/walletHandlers";
import { useNotify } from "../context/NotificationContext";

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
          padding: "12px 48px",
          background: T.IK,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: T.C,
          }}
        >
          MY WALLET
        </span>

        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: T.CR,
            opacity: 0.4,
          }}
        >
          SECURE PAYMENTS
        </span>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 32px",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: T.LIGHT_IK,
            }}
          >
            LOADING...
          </div>
        ) : (
          <>
            {/* BALANCE */}
            <div
              style={{
                border: `1px solid ${T.IK}`,
                marginBottom: 32,
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  padding: "12px 24px",
                  background: T.IK,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: T.C,
                  }}
                >
                  CURRENT BALANCE
                </span>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: T.CR,
                    opacity: 0.4,
                  }}
                >
                  WALLET
                </span>
              </div>

              <div
                style={{
                  padding: "36px 28px",
                  background: T.CR,
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: T.IK,
                    lineHeight: 1,
                  }}
                >
                  Rs.{" "}
                  {Number(balance).toLocaleString("en-PK", {
                    minimumFractionDigits: 2,
                  })}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.LIGHT_IK,
                    marginTop: 8,
                    letterSpacing: "0.1em",
                  }}
                >
                  AVAILABLE BALANCE
                </div>
              </div>
            </div>

            {/* TOPUP SECTION */}
            <div
              style={{
                border: `1px solid ${T.IK}`,
                marginBottom: 32,
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  padding: "14px 24px",
                  background: T.IK,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: T.C,
                  }}
                >
                  ADD FUNDS
                </span>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: T.CR,
                    opacity: 0.5,
                  }}
                >
                  VISA / MASTERCARD
                </span>
              </div>

              <div
                style={{
                  background: T.CR,
                  padding: 28,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                }}
              >
                {/* LEFT */}
                <div>
                  <label style={labelStyle}>Quick Amount</label>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 28,
                    }}
                  >
                    {TOPUP_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTopUpAmount(amt)}
                        style={{
                          padding: "12px 18px",
                          border: `1px solid ${T.IK}20`,
                          background: "#fff",
                          fontSize: 11,
                          fontWeight: 800,
                          color: T.IK,
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = T.IK;
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.color = T.IK;
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
                      border: `1px solid ${T.IK}15`,
                      marginBottom: 22,
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        fontWeight: 900,
                        fontSize: 13,
                        color: T.IK,
                        borderRight: `1px solid ${T.IK}15`,
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
                        padding: "16px",
                        fontSize: 16,
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
                      padding: "16px",
                      border: `1px solid ${T.IK}15`,
                      background: "#fff",
                      outline: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 18,
                    }}
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
                      padding: "16px",
                      border: `1px solid ${T.IK}15`,
                      background: "#fff",
                      outline: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 18,
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 26,
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
                          padding: "16px",
                          border: `1px solid ${T.IK}15`,
                          background: "#fff",
                          outline: "none",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
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
                          padding: "16px",
                          border: `1px solid ${T.IK}15`,
                          background: "#fff",
                          outline: "none",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
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
                      padding: "18px",
                      border: "none",
                      background:
                        topping ||
                        !topUpAmount ||
                        !cardNumber ||
                        !cardName ||
                        !expiry ||
                        !cvv
                          ? "#999"
                          : T.C,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 12,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {topping ? "PROCESSING..." : "ADD FUNDS"}
                  </button>
                </div>

                {/* RIGHT CARD */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 420,
                      height: 240,
                      borderRadius: 24,
                      background:
                        "linear-gradient(135deg, #111 0%, #2b2b2b 45%, #000 100%)",
                      padding: 28,
                      color: "#fff",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
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
            <div style={{ border: `1px solid ${T.IK}` }}>
              <div
                style={{
                  padding: "12px 24px",
                  background: T.IK,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: T.C,
                  }}
                >
                  TRANSACTION HISTORY
                </span>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: T.CR,
                    opacity: 0.4,
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
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: T.LIGHT_IK,
                      margin: 0,
                    }}
                  >
                    NO TRANSACTIONS YET
                  </p>
                </div>
              ) : (
                <div style={{ background: T.CR }}>
                  {transactions.map((txn, idx) => {
                    const meta =
                      TXN_COLORS[txn.type] || TXN_COLORS.topup;

                    const isDebit = txn.type === "debit";

                    return (
                      <div
                        key={txn.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "18px 24px",
                          borderBottom:
                            idx < transactions.length - 1
                              ? `1px solid ${T.IK}15`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            padding: "5px 10px",
                            fontSize: 8,
                            fontWeight: 900,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            background: meta.bg,
                            color: meta.color,
                            flexShrink: 0,
                            minWidth: 64,
                            textAlign: "center",
                          }}
                        >
                          {meta.label}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: T.IK,
                            }}
                          >
                            {txn.note || "Wallet Transaction"}
                          </div>

                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: T.LIGHT_IK,
                              marginTop: 4,
                              letterSpacing: "0.08em",
                            }}
                          >
                            {new Date(txn.created_at).toLocaleString(
                              "en-PK",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: isDebit
                                ? "#ea5455"
                                : "#28c76f",
                            }}
                          >
                            {isDebit ? "-" : "+"} Rs.{" "}
                            {Number(txn.amount).toLocaleString(
                              "en-PK",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: T.LIGHT_IK,
                              marginTop: 2,
                            }}
                          >
                            Bal: Rs.{" "}
                            {Number(
                              txn.balance_after
                            ).toLocaleString("en-PK", {
                              minimumFractionDigits: 2,
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