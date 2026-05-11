ALTER TABLE bookings
MODIFY COLUMN status ENUM(
    'requested',
    'accepted',
    'completed',
    'cancelled',
    'rejected'
) DEFAULT 'requested';

-- ── Step 1: Add wallet_balance to users ──────────────────────────
ALTER TABLE users
  ADD COLUMN wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00
  AFTER avatar_url;

-- ── Step 2: Create wallet_transactions table ──────────────────────
CREATE TABLE wallet_transactions (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED  NOT NULL,
  booking_id   BIGINT UNSIGNED  NULL,
  type         ENUM('credit','debit','topup') NOT NULL,
  amount       DECIMAL(10,2)    NOT NULL,
  balance_after DECIMAL(10,2)  NOT NULL,
  note         VARCHAR(255)     NULL,
  created_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_wt_user   (user_id),
  KEY idx_wt_booking (booking_id),

  CONSTRAINT fk_wt_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_wt_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;