-- =============================================================
--  TASKIT — Complete MySQL Database Schema
--  Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
--  Designed for: Pakistan service-marketplace platform
--  Normalization: 3NF throughout; BCNF where applicable
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- =============================================================
-- 1. ADMIN USERS
-- Kept separate from regular users intentionally (different auth,
-- no wallet/points, strict RBAC, never deleted — only deactivated).
-- =============================================================
CREATE TABLE admin_users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)        NOT NULL,
    email           VARCHAR(180)        NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL,
    role            ENUM(
                        'super_admin',
                        'support_agent',
                        'finance_manager',
                        'content_moderator'
                    )                   NOT NULL DEFAULT 'support_agent',
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    last_login_at   DATETIME            NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 2. USERS
-- Single table for both customers and providers (role column).
-- Soft-delete via deleted_at so foreign keys stay intact.
-- wallet_balance and loyalty_points are denormalized here for
-- fast reads; source of truth is wallet_transactions /
-- user_loyalty_points tables.
-- =============================================================
CREATE TABLE users (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    full_name           VARCHAR(150)        NOT NULL,
    email               VARCHAR(180)        NULL,
    phone               VARCHAR(20)         NOT NULL,
    password_hash       VARCHAR(255)        NOT NULL,
    role                ENUM(
                            'customer',
                            'provider',
                            'both'
                        )                   NOT NULL DEFAULT 'customer',
    status              ENUM(
                            'active',
                            'suspended',
                            'banned',
                            'pending_verification'
                        )                   NOT NULL DEFAULT 'pending_verification',
    avatar_url          VARCHAR(500)        NULL,
    referral_code       VARCHAR(20)         NOT NULL DEFAULT '',
    referred_by         BIGINT UNSIGNED     NULL,
    wallet_balance      DECIMAL(12,2)       NOT NULL DEFAULT 0.00,
    loyalty_points      INT                 NOT NULL DEFAULT 0,
    is_email_verified   TINYINT(1)          NOT NULL DEFAULT 0,
    is_phone_verified   TINYINT(1)          NOT NULL DEFAULT 0,
    is_business_account TINYINT(1)          NOT NULL DEFAULT 0,
    business_name       VARCHAR(200)        NULL,
    business_ntn        VARCHAR(50)         NULL,
    fcm_token           VARCHAR(500)        NULL,
    preferred_language  VARCHAR(10)         NOT NULL DEFAULT 'en',
    preferred_currency  VARCHAR(5)          NOT NULL DEFAULT 'PKR',
    last_login_at       DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          DATETIME            NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_phone (phone),
    UNIQUE KEY uq_user_email (email),
    KEY idx_users_role (role),
    KEY idx_users_status (status),
    KEY idx_users_referred_by (referred_by),
    KEY idx_users_deleted_at (deleted_at),
    CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- referral_code unique index (separate so trigger can populate after id is known)
ALTER TABLE users ADD UNIQUE KEY uq_referral_code (referral_code);

-- =============================================================
-- 3. OTP / VERIFICATION TOKENS
-- =============================================================
CREATE TABLE otp_tokens (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED     NOT NULL,
    type        ENUM(
                    'phone_verify',
                    'email_verify',
                    'password_reset',
                    'login'
                )                   NOT NULL,
    token       VARCHAR(10)         NOT NULL,
    expires_at  DATETIME            NOT NULL,
    is_used     TINYINT(1)          NOT NULL DEFAULT 0,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_otp_user_type (user_id, type),
    KEY idx_otp_expires (expires_at),
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 4. USER ADDRESSES
-- =============================================================
CREATE TABLE addresses (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED     NOT NULL,
    label           VARCHAR(50)         NOT NULL DEFAULT 'Home',
    address_line1   VARCHAR(255)        NOT NULL,
    address_line2   VARCHAR(255)        NULL,
    city            VARCHAR(100)        NOT NULL,
    province        VARCHAR(100)        NOT NULL,
    postal_code     VARCHAR(10)         NULL,
    lat             DECIMAL(10,7)       NOT NULL,
    lng             DECIMAL(10,7)       NOT NULL,
    is_default      TINYINT(1)          NOT NULL DEFAULT 0,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_addresses_user (user_id),
    KEY idx_addresses_location (lat, lng),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 5. CATEGORIES & SUBCATEGORIES
-- =============================================================
CREATE TABLE categories (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    slug        VARCHAR(100)    NOT NULL,
    icon_url    VARCHAR(500)    NULL,
    description TEXT            NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    sort_order  SMALLINT        NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_category_slug (slug),
    KEY idx_categories_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subcategories (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    category_id     INT UNSIGNED    NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    icon_url        VARCHAR(500)    NULL,
    description     TEXT            NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    sort_order      SMALLINT        NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_subcategory_slug (slug),
    KEY idx_subcategories_category (category_id),
    CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 6. PROVIDER PROFILES
-- =============================================================
CREATE TABLE providers (
    id                      BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id                 BIGINT UNSIGNED     NOT NULL,
    bio                     TEXT                NULL,
    years_of_experience     TINYINT UNSIGNED    NULL,
    avg_rating              DECIMAL(3,2)        NOT NULL DEFAULT 0.00,
    total_reviews           INT                 NOT NULL DEFAULT 0,
    total_completed_jobs    INT                 NOT NULL DEFAULT 0,
    total_cancelled_jobs    INT                 NOT NULL DEFAULT 0,
    response_rate           DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    avg_response_minutes    INT                 NOT NULL DEFAULT 0,
    service_radius_km       DECIMAL(6,2)        NOT NULL DEFAULT 10.00,
    lat                     DECIMAL(10,7)       NULL,
    lng                     DECIMAL(10,7)       NULL,
    availability_status     ENUM(
                                'available',
                                'busy',
                                'offline'
                            )                   NOT NULL DEFAULT 'offline',
    is_featured             TINYINT(1)          NOT NULL DEFAULT 0,
    trust_score             DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    ai_skill_score          DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    profile_approved_at     DATETIME            NULL,
    created_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_provider_user (user_id),
    KEY idx_providers_location (lat, lng),
    KEY idx_providers_rating (avg_rating),
    KEY idx_providers_trust (trust_score),
    KEY idx_providers_availability (availability_status),
    CONSTRAINT fk_providers_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 7. PROVIDER SERVICES
-- =============================================================
CREATE TABLE provider_services (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    subcategory_id  INT UNSIGNED        NOT NULL,
    title           VARCHAR(200)        NOT NULL,
    description     TEXT                NULL,
    pricing_type    ENUM(
                        'fixed',
                        'hourly',
                        'negotiable',
                        'starting_from'
                    )                   NOT NULL DEFAULT 'fixed',
    base_price      DECIMAL(10,2)       NOT NULL,
    max_price       DECIMAL(10,2)       NULL,
    price_unit      VARCHAR(30)         NULL,
    estimated_hours DECIMAL(4,1)        NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ps_provider (provider_id),
    KEY idx_ps_subcategory (subcategory_id),
    KEY idx_ps_active (is_active),
    CONSTRAINT fk_ps_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_subcategory FOREIGN KEY (subcategory_id)
        REFERENCES subcategories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 8. PROVIDER AVAILABILITY SCHEDULE
-- =============================================================
CREATE TABLE provider_availability (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    day_of_week     TINYINT UNSIGNED    NOT NULL,
    start_time      TIME                NOT NULL,
    end_time        TIME                NOT NULL,
    is_available    TINYINT(1)          NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_provider_day (provider_id, day_of_week),
    CONSTRAINT fk_pa_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT chk_pa_time CHECK (end_time > start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE provider_availability_overrides (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    override_date   DATE                NOT NULL,
    is_available    TINYINT(1)          NOT NULL DEFAULT 0,
    start_time      TIME                NULL,
    end_time        TIME                NULL,
    note            VARCHAR(255)        NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_provider_override_date (provider_id, override_date),
    CONSTRAINT fk_pao_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 9. PROVIDER DOCUMENTS (KYC / Verification)
-- =============================================================
CREATE TABLE provider_documents (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id         BIGINT UNSIGNED     NOT NULL,
    document_type       ENUM(
                            'cnic_front',
                            'cnic_back',
                            'selfie_with_cnic',
                            'police_verification',
                            'professional_certificate',
                            'business_license',
                            'other'
                        )                   NOT NULL,
    file_url            VARCHAR(500)        NOT NULL,
    verification_status ENUM(
                            'pending',
                            'approved',
                            'rejected'
                        )                   NOT NULL DEFAULT 'pending',
    rejection_reason    TEXT                NULL,
    verified_by         INT UNSIGNED        NULL,
    verified_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pd_provider (provider_id),
    KEY idx_pd_status (verification_status),
    CONSTRAINT fk_pd_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT fk_pd_admin FOREIGN KEY (verified_by)
        REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 10. BADGES
-- =============================================================
CREATE TABLE badges (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code        VARCHAR(50)     NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    description TEXT            NULL,
    icon_url    VARCHAR(500)    NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_badge_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO badges (code, name, description) VALUES
('top_rated',       'Top Rated',        'Maintains 4.5+ rating with 20+ reviews'),
('fast_responder',  'Fast Responder',   'Average response time under 15 minutes'),
('most_booked',     'Most Booked',      'Completed 50+ jobs on the platform'),
('verified_pro',    'Verified Pro',     'Full KYC documents approved by admin'),
('expert_level',    'Expert Level',     'AI skill score above 85'),
('rising_star',     'Rising Star',      'New provider with 5+ 5-star reviews');

CREATE TABLE provider_badges (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    badge_id        INT UNSIGNED        NOT NULL,
    awarded_by      ENUM('system','admin') NOT NULL DEFAULT 'system',
    awarded_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME            NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_provider_badge (provider_id, badge_id),
    KEY idx_pb_badge (badge_id),
    CONSTRAINT fk_pb_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT fk_pb_badge FOREIGN KEY (badge_id)
        REFERENCES badges (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 11. BOOKINGS
-- =============================================================
CREATE TABLE bookings (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_ref         VARCHAR(20)         NOT NULL DEFAULT '',
    user_id             BIGINT UNSIGNED     NOT NULL,
    provider_id         BIGINT UNSIGNED     NOT NULL,
    service_id          BIGINT UNSIGNED     NOT NULL,
    address_id          BIGINT UNSIGNED     NOT NULL,
    status              ENUM(
                            'requested',
                            'accepted',
                            'in_progress',
                            'completed',
                            'cancelled',
                            'disputed'
                        )                   NOT NULL DEFAULT 'requested',
    description         TEXT                NULL,
    special_instructions TEXT               NULL,
    scheduled_at        DATETIME            NOT NULL,
    accepted_at         DATETIME            NULL,
    started_at          DATETIME            NULL,
    completed_at        DATETIME            NULL,
    quoted_price        DECIMAL(10,2)       NOT NULL,
    final_price         DECIMAL(10,2)       NULL,
    platform_fee        DECIMAL(10,2)       NULL,
    platform_fee_pct    DECIMAL(5,2)        NOT NULL DEFAULT 10.00,
    cancellation_reason TEXT                NULL,
    cancelled_by        BIGINT UNSIGNED     NULL,
    is_group_booking    TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_booking_ref (booking_ref),
    KEY idx_bookings_user (user_id),
    KEY idx_bookings_provider (provider_id),
    KEY idx_bookings_status (status),
    KEY idx_bookings_scheduled (scheduled_at),
    KEY idx_bookings_provider_status (provider_id, status, scheduled_at),
    KEY idx_bookings_user_status (user_id, status, created_at),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_service FOREIGN KEY (service_id)
        REFERENCES provider_services (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_address FOREIGN KEY (address_id)
        REFERENCES addresses (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_cancelled_by FOREIGN KEY (cancelled_by)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 12. BOOKING STATUS HISTORY
-- =============================================================
CREATE TABLE booking_status_history (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id  BIGINT UNSIGNED     NOT NULL,
    from_status VARCHAR(30)         NULL,
    to_status   VARCHAR(30)         NOT NULL,
    changed_by  BIGINT UNSIGNED     NULL,
    note        TEXT                NULL,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bsh_booking (booking_id),
    CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_bsh_user FOREIGN KEY (changed_by)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 13. JOB PHOTOS
-- =============================================================
CREATE TABLE job_photos (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id      BIGINT UNSIGNED     NOT NULL,
    uploaded_by     BIGINT UNSIGNED     NOT NULL,
    photo_type      ENUM('before','after','in_progress','other') NOT NULL,
    url             VARCHAR(500)        NOT NULL,
    caption         VARCHAR(300)        NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_jp_booking (booking_id),
    CONSTRAINT fk_jp_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_jp_user FOREIGN KEY (uploaded_by)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 14. PAYMENTS
-- =============================================================
CREATE TABLE payments (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id          BIGINT UNSIGNED     NOT NULL,
    user_id             BIGINT UNSIGNED     NOT NULL,
    amount              DECIMAL(12,2)       NOT NULL,
    platform_fee        DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
    provider_payout     DECIMAL(12,2)       NOT NULL DEFAULT 0.00,
    method              ENUM(
                            'cash',
                            'wallet',
                            'jazzcash',
                            'easypaisa',
                            'bank_transfer',
                            'card'
                        )                   NOT NULL,
    status              ENUM(
                            'pending',
                            'authorised',
                            'captured',
                            'refunded',
                            'partially_refunded',
                            'failed',
                            'cancelled'
                        )                   NOT NULL DEFAULT 'pending',
    gateway_txn_id      VARCHAR(255)        NULL,
    gateway_response    JSON                NULL,
    escrow_status       ENUM(
                            'held',
                            'released',
                            'refunded'
                        )                   NULL,
    escrow_released_at  DATETIME            NULL,
    refund_amount       DECIMAL(12,2)       NULL,
    refund_reason       TEXT                NULL,
    refunded_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payment_booking (booking_id),
    KEY idx_payments_user (user_id),
    KEY idx_payments_status (status),
    KEY idx_payments_gateway (gateway_txn_id),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 15. WALLET TRANSACTIONS (immutable ledger)
-- =============================================================
CREATE TABLE wallet_transactions (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED     NOT NULL,
    type            ENUM(
                        'credit',
                        'debit',
                        'refund',
                        'withdrawal',
                        'referral_bonus',
                        'loyalty_redemption',
                        'platform_fee'
                    )                   NOT NULL,
    amount          DECIMAL(12,2)       NOT NULL,
    balance_after   DECIMAL(12,2)       NOT NULL,
    ref_id          VARCHAR(50)         NULL,
    ref_type        VARCHAR(50)         NULL,
    note            VARCHAR(300)        NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_wt_user (user_id),
    KEY idx_wt_type (type),
    KEY idx_wt_ref (ref_type, ref_id),
    CONSTRAINT fk_wt_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 16. PROVIDER EARNINGS
-- =============================================================
CREATE TABLE earnings (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    booking_id      BIGINT UNSIGNED     NOT NULL,
    payment_id      BIGINT UNSIGNED     NOT NULL,
    gross_amount    DECIMAL(12,2)       NOT NULL,
    platform_fee    DECIMAL(10,2)       NOT NULL,
    net_amount      DECIMAL(12,2)       NOT NULL,
    status          ENUM(
                        'pending',
                        'available',
                        'withdrawn',
                        'on_hold'
                    )                   NOT NULL DEFAULT 'pending',
    available_at    DATETIME            NULL,
    payout_at       DATETIME            NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_earnings_booking (booking_id),
    KEY idx_earnings_provider (provider_id),
    KEY idx_earnings_status (status),
    CONSTRAINT fk_earnings_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_earnings_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_earnings_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 17. WITHDRAWAL REQUESTS
-- =============================================================
CREATE TABLE withdrawal_requests (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    amount          DECIMAL(12,2)       NOT NULL,
    method          ENUM(
                        'bank_transfer',
                        'jazzcash',
                        'easypaisa'
                    )                   NOT NULL,
    account_details JSON                NOT NULL,
    status          ENUM(
                        'pending',
                        'processing',
                        'completed',
                        'rejected'
                    )                   NOT NULL DEFAULT 'pending',
    processed_by    INT UNSIGNED        NULL,
    rejection_reason TEXT               NULL,
    processed_at    DATETIME            NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_wr_provider (provider_id),
    KEY idx_wr_status (status),
    CONSTRAINT fk_wr_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_wr_admin FOREIGN KEY (processed_by)
        REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 18. INVOICES
-- =============================================================
CREATE TABLE invoices (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    payment_id      BIGINT UNSIGNED     NOT NULL,
    booking_id      BIGINT UNSIGNED     NOT NULL,
    invoice_number  VARCHAR(30)         NOT NULL,
    subtotal        DECIMAL(12,2)       NOT NULL,
    platform_fee    DECIMAL(10,2)       NOT NULL,
    total           DECIMAL(12,2)       NOT NULL,
    status          ENUM('draft','issued','void') NOT NULL DEFAULT 'issued',
    pdf_url         VARCHAR(500)        NULL,
    issued_at       DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invoice_number (invoice_number),
    UNIQUE KEY uq_invoice_payment (payment_id),
    KEY idx_invoices_booking (booking_id),
    CONSTRAINT fk_invoices_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 19. REVIEWS
-- =============================================================
CREATE TABLE reviews (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id          BIGINT UNSIGNED     NOT NULL,
    reviewer_id         BIGINT UNSIGNED     NOT NULL,
    reviewee_id         BIGINT UNSIGNED     NOT NULL,
    reviewer_role       ENUM('customer','provider') NOT NULL,
    rating              TINYINT UNSIGNED    NOT NULL,
    comment             TEXT                NULL,
    is_flagged          TINYINT(1)          NOT NULL DEFAULT 0,
    is_verified         TINYINT(1)          NOT NULL DEFAULT 1,
    sentiment_score     FLOAT               NULL,
    ai_summary          VARCHAR(500)        NULL,
    helpful_count       INT                 NOT NULL DEFAULT 0,
    provider_reply      TEXT                NULL,
    provider_replied_at DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review_booking_role (booking_id, reviewer_role),
    KEY idx_reviews_reviewer (reviewer_id),
    KEY idx_reviews_reviewee (reviewee_id),
    KEY idx_reviews_rating (rating),
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewee FOREIGN KEY (reviewee_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE review_helpful_votes (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    review_id   BIGINT UNSIGNED     NOT NULL,
    user_id     BIGINT UNSIGNED     NOT NULL,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review_vote (review_id, user_id),
    CONSTRAINT fk_rhv_review FOREIGN KEY (review_id)
        REFERENCES reviews (id) ON DELETE CASCADE,
    CONSTRAINT fk_rhv_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 20. CHAT ROOMS & MESSAGES
-- =============================================================
CREATE TABLE chats (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id          BIGINT UNSIGNED     NOT NULL,
    user_id             BIGINT UNSIGNED     NOT NULL,
    provider_user_id    BIGINT UNSIGNED     NOT NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_chat_booking (booking_id),
    KEY idx_chats_user (user_id),
    KEY idx_chats_provider (provider_user_id),
    CONSTRAINT fk_chats_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_chats_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_chats_provider_user FOREIGN KEY (provider_user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    chat_id         BIGINT UNSIGNED     NOT NULL,
    sender_id       BIGINT UNSIGNED     NOT NULL,
    message_type    ENUM(
                        'text',
                        'image',
                        'file',
                        'location',
                        'system'
                    )                   NOT NULL DEFAULT 'text',
    content         TEXT                NULL,
    attachment_url  VARCHAR(500)        NULL,
    is_read         TINYINT(1)          NOT NULL DEFAULT 0,
    read_at         DATETIME            NULL,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_cm_chat (chat_id),
    KEY idx_cm_sender (sender_id),
    KEY idx_cm_read (is_read),
    CONSTRAINT fk_cm_chat FOREIGN KEY (chat_id)
        REFERENCES chats (id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_sender FOREIGN KEY (sender_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 21. DISPUTES
-- =============================================================
CREATE TABLE disputes (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id      BIGINT UNSIGNED     NOT NULL,
    raised_by       BIGINT UNSIGNED     NOT NULL,
    dispute_type    ENUM(
                        'no_show',
                        'poor_quality',
                        'overcharged',
                        'damage',
                        'fraud',
                        'other'
                    )                   NOT NULL,
    description     TEXT                NOT NULL,
    status          ENUM(
                        'open',
                        'under_review',
                        'resolved_for_user',
                        'resolved_for_provider',
                        'closed'
                    )                   NOT NULL DEFAULT 'open',
    assigned_to     INT UNSIGNED        NULL,
    resolution_note TEXT                NULL,
    refund_amount   DECIMAL(12,2)       NULL,
    resolved_at     DATETIME            NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_disputes_booking (booking_id),
    KEY idx_disputes_status (status),
    CONSTRAINT fk_disputes_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_disputes_user FOREIGN KEY (raised_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_disputes_admin FOREIGN KEY (assigned_to)
        REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dispute_messages (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    dispute_id      BIGINT UNSIGNED     NOT NULL,
    sender_id       BIGINT UNSIGNED     NULL,
    sender_type     ENUM('user','admin') NOT NULL,
    message         TEXT                NOT NULL,
    attachment_url  VARCHAR(500)        NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_dm_dispute (dispute_id),
    CONSTRAINT fk_dm_dispute FOREIGN KEY (dispute_id)
        REFERENCES disputes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 22. NOTIFICATIONS
-- =============================================================
CREATE TABLE notifications (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED     NOT NULL,
    type        ENUM(
                    'booking_request',
                    'booking_accepted',
                    'booking_declined',
                    'booking_started',
                    'booking_completed',
                    'booking_cancelled',
                    'payment_received',
                    'payment_released',
                    'review_received',
                    'dispute_opened',
                    'dispute_resolved',
                    'chat_message',
                    'badge_earned',
                    'promo',
                    'system'
                )                   NOT NULL,
    title       VARCHAR(200)        NOT NULL,
    body        TEXT                NOT NULL,
    ref_id      VARCHAR(50)         NULL,
    ref_type    VARCHAR(50)         NULL,
    is_read     TINYINT(1)          NOT NULL DEFAULT 0,
    read_at     DATETIME            NULL,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_user_unread (user_id, is_read, created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 23. SUBSCRIPTION PLANS
-- =============================================================
CREATE TABLE subscription_plans_catalog (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    code        VARCHAR(50)     NOT NULL,
    price_pkr   DECIMAL(10,2)   NOT NULL,
    duration_days INT           NOT NULL,
    features    JSON            NOT NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_plan_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO subscription_plans_catalog (name, code, price_pkr, duration_days, features) VALUES
('Basic',    'basic',    0,      30,  '["Profile listing","Basic analytics"]'),
('Pro',      'pro',      1499,   30,  '["Featured listing","Priority ranking","Advanced analytics","Badge eligibility"]'),
('Business', 'business', 2999,   30,  '["All Pro features","Multiple services","Team accounts","Dedicated support"]');

CREATE TABLE provider_subscriptions (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id BIGINT UNSIGNED     NOT NULL,
    plan_id     INT UNSIGNED        NOT NULL,
    status      ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
    payment_id  BIGINT UNSIGNED     NULL,
    starts_at   DATETIME            NOT NULL,
    ends_at     DATETIME            NOT NULL,
    auto_renew  TINYINT(1)          NOT NULL DEFAULT 0,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_psub_provider_status (provider_id, status),
    KEY idx_psub_ends (ends_at),
    CONSTRAINT fk_psub_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT fk_psub_plan FOREIGN KEY (plan_id)
        REFERENCES subscription_plans_catalog (id) ON DELETE RESTRICT,
    CONSTRAINT fk_psub_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 24. LISTING BOOSTS
-- =============================================================
CREATE TABLE listing_boosts (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    service_id      BIGINT UNSIGNED     NULL,
    amount_paid     DECIMAL(10,2)       NOT NULL,
    payment_id      BIGINT UNSIGNED     NULL,
    boost_type      ENUM('search_top','category_featured','homepage') NOT NULL,
    starts_at       DATETIME            NOT NULL,
    ends_at         DATETIME            NOT NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    impressions     INT                 NOT NULL DEFAULT 0,
    clicks          INT                 NOT NULL DEFAULT 0,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_lb_provider (provider_id),
    KEY idx_lb_active_end (is_active, ends_at),
    CONSTRAINT fk_lb_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT fk_lb_service FOREIGN KEY (service_id)
        REFERENCES provider_services (id) ON DELETE CASCADE,
    CONSTRAINT fk_lb_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 25. USER LOYALTY POINTS (ledger)
-- =============================================================
CREATE TABLE user_loyalty_points (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED     NOT NULL,
    event_type      ENUM(
                        'booking_completed',
                        'review_given',
                        'referral_success',
                        'signup_bonus',
                        'redeemed',
                        'expired',
                        'manual_award'
                    )                   NOT NULL,
    points          INT                 NOT NULL,
    balance_after   INT                 NOT NULL,
    ref_id          VARCHAR(50)         NULL,
    note            VARCHAR(300)        NULL,
    expires_at      DATETIME            NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ulp_user (user_id),
    KEY idx_ulp_expires (expires_at),
    CONSTRAINT fk_ulp_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 26. REFERRALS
-- =============================================================
CREATE TABLE referrals (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    referrer_id     BIGINT UNSIGNED     NOT NULL,
    referred_id     BIGINT UNSIGNED     NOT NULL,
    status          ENUM(
                        'pending',
                        'qualified',
                        'rewarded'
                    )                   NOT NULL DEFAULT 'pending',
    points_awarded  INT                 NULL,
    booking_id      BIGINT UNSIGNED     NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_referral_pair (referrer_id, referred_id),
    KEY idx_referrals_referred (referred_id),
    CONSTRAINT fk_ref_referrer FOREIGN KEY (referrer_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ref_referred FOREIGN KEY (referred_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ref_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 27. REPORTS
-- =============================================================
CREATE TABLE reports (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    reporter_id     BIGINT UNSIGNED     NOT NULL,
    reported_id     BIGINT UNSIGNED     NOT NULL,
    entity_type     ENUM('user','provider','review','booking','service') NOT NULL,
    entity_id       VARCHAR(20)         NOT NULL,
    reason          ENUM(
                        'fake_profile',
                        'fake_review',
                        'fraud',
                        'inappropriate_content',
                        'spam',
                        'harassment',
                        'other'
                    )                   NOT NULL,
    description     TEXT                NULL,
    status          ENUM('pending','reviewed','action_taken','dismissed') NOT NULL DEFAULT 'pending',
    handled_by      INT UNSIGNED        NULL,
    admin_note      TEXT                NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_reports_reporter (reporter_id),
    KEY idx_reports_status (status),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_reported FOREIGN KEY (reported_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_admin FOREIGN KEY (handled_by)
        REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 28. AI MATCH LOGS
-- =============================================================
CREATE TABLE ai_match_logs (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id             BIGINT UNSIGNED     NOT NULL,
    booking_id          BIGINT UNSIGNED     NULL,
    subcategory_id      INT UNSIGNED        NULL,
    user_lat            DECIMAL(10,7)       NULL,
    user_lng            DECIMAL(10,7)       NULL,
    candidates_json     JSON                NULL,
    selected_provider   BIGINT UNSIGNED     NULL,
    distance_score      FLOAT               NULL,
    rating_score        FLOAT               NULL,
    price_score         FLOAT               NULL,
    response_score      FLOAT               NULL,
    trust_score_used    FLOAT               NULL,
    final_score         FLOAT               NULL,
    user_accepted       TINYINT(1)          NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_aml_user (user_id),
    KEY idx_aml_created (created_at),
    CONSTRAINT fk_aml_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 29. PLATFORM SETTINGS
-- =============================================================
CREATE TABLE platform_settings (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `key`       VARCHAR(100)    NOT NULL,
    value       TEXT            NOT NULL,
    description VARCHAR(300)    NULL,
    updated_by  INT UNSIGNED    NULL,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_setting_key (`key`),
    CONSTRAINT fk_settings_admin FOREIGN KEY (updated_by)
        REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO platform_settings (`key`, value, description) VALUES
('platform_fee_pct',            '10',               'Platform commission percentage'),
('min_booking_price',           '200',              'Minimum booking price in PKR'),
('escrow_release_hours',        '24',               'Hours after job completion before escrow releases'),
('referral_points',             '100',              'Points awarded per successful referral'),
('booking_points_per_100',      '5',                'Loyalty points per 100 PKR spent'),
('max_cancellations_per_month', '3',                'Max cancellations before account review'),
('ai_match_candidates',         '5',                'Number of providers AI returns per match'),
('support_phone',               '0300-TASKIT',      'Customer support phone number'),
('support_email',               'support@taskit.pk','Customer support email');

-- =============================================================
-- 30. SERVICE AREAS
-- =============================================================
CREATE TABLE service_areas (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    city        VARCHAR(100)    NOT NULL,
    province    VARCHAR(100)    NOT NULL,
    lat         DECIMAL(10,7)   NOT NULL,
    lng         DECIMAL(10,7)   NOT NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_sa_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE provider_service_areas (
    provider_id     BIGINT UNSIGNED     NOT NULL,
    area_id         INT UNSIGNED        NOT NULL,
    PRIMARY KEY (provider_id, area_id),
    CONSTRAINT fk_psa_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE,
    CONSTRAINT fk_psa_area FOREIGN KEY (area_id)
        REFERENCES service_areas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 31. PROMO CODES
-- =============================================================
CREATE TABLE promo_codes (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code                VARCHAR(30)     NOT NULL,
    discount_type       ENUM('percentage','fixed_pkr') NOT NULL,
    discount_value      DECIMAL(10,2)   NOT NULL,
    min_booking_value   DECIMAL(10,2)   NOT NULL DEFAULT 0,
    max_discount_pkr    DECIMAL(10,2)   NULL,
    max_uses            INT             NULL,
    used_count          INT             NOT NULL DEFAULT 0,
    max_uses_per_user   INT             NOT NULL DEFAULT 1,
    valid_from          DATETIME        NOT NULL,
    valid_until         DATETIME        NOT NULL,
    applicable_category INT UNSIGNED    NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          INT UNSIGNED    NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_promo_code (code),
    KEY idx_promo_valid (valid_from, valid_until, is_active),
    CONSTRAINT fk_promo_category FOREIGN KEY (applicable_category)
        REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT fk_promo_admin FOREIGN KEY (created_by)
        REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE promo_code_usages (
    id                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    promo_id            INT UNSIGNED        NOT NULL,
    user_id             BIGINT UNSIGNED     NOT NULL,
    booking_id          BIGINT UNSIGNED     NOT NULL,
    discount_applied    DECIMAL(10,2)       NOT NULL,
    used_at             DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_promo_booking (promo_id, booking_id),
    KEY idx_pcu_user (user_id),
    CONSTRAINT fk_pcu_promo FOREIGN KEY (promo_id)
        REFERENCES promo_codes (id) ON DELETE CASCADE,
    CONSTRAINT fk_pcu_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_pcu_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 32. CALENDAR SYNC TOKENS
-- =============================================================
CREATE TABLE calendar_sync_tokens (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     BIGINT UNSIGNED     NOT NULL,
    provider_type   ENUM('google')      NOT NULL DEFAULT 'google',
    access_token    TEXT                NOT NULL,
    refresh_token   TEXT                NULL,
    expires_at      DATETIME            NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cst_provider (provider_id, provider_type),
    CONSTRAINT fk_cst_provider FOREIGN KEY (provider_id)
        REFERENCES providers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================================
ALTER TABLE providers ADD FULLTEXT INDEX ft_provider_bio (bio);
ALTER TABLE provider_services ADD FULLTEXT INDEX ft_service_title_desc (title, description);

-- Composite index for AI ranking queries
ALTER TABLE providers ADD INDEX idx_providers_ai_rank (trust_score, avg_rating, total_completed_jobs);
ALTER TABLE providers ADD INDEX idx_providers_geo_status (lat, lng, availability_status);

-- =============================================================
-- TRIGGERS
-- =============================================================

DELIMITER $$



-- T2: Auto-generate booking_ref before insert
CREATE TRIGGER trg_bookings_ref
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    SET NEW.booking_ref = CONCAT(
        'TK-',
        DATE_FORMAT(NOW(), '%Y%m'),
        LPAD(FLOOR(RAND() * 999999), 6, '0')
    );
END$$

-- T3: Log booking status changes to history
CREATE TRIGGER trg_bookings_status_history
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO booking_status_history
            (booking_id, from_status, to_status, changed_by, created_at)
        VALUES
            (NEW.id, OLD.status, NEW.status, NEW.cancelled_by, NOW());
    END IF;
END$$

-- T4: Update provider rating stats after a review is inserted
CREATE TRIGGER trg_reviews_update_provider
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE v_provider_id BIGINT UNSIGNED;

    IF NEW.reviewer_role = 'customer' THEN
        SELECT b.provider_id INTO v_provider_id
        FROM bookings b
        WHERE b.id = NEW.booking_id
        LIMIT 1;

        IF v_provider_id IS NOT NULL THEN
            UPDATE providers
            SET avg_rating    = (
                    SELECT ROUND(AVG(r.rating), 2)
                    FROM reviews r
                    JOIN bookings b ON r.booking_id = b.id
                    WHERE b.provider_id = v_provider_id
                      AND r.reviewer_role = 'customer'
                      AND r.is_flagged = 0
                ),
                total_reviews = (
                    SELECT COUNT(*)
                    FROM reviews r
                    JOIN bookings b ON r.booking_id = b.id
                    WHERE b.provider_id = v_provider_id
                      AND r.reviewer_role = 'customer'
                      AND r.is_flagged = 0
                )
            WHERE id = v_provider_id;
        END IF;
    END IF;
END$$

-- T5: Update provider job counters on booking status change
CREATE TRIGGER trg_booking_completed_stats
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
        UPDATE providers
        SET total_completed_jobs = total_completed_jobs + 1
        WHERE id = NEW.provider_id;
    END IF;

    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
        UPDATE providers
        SET total_cancelled_jobs = total_cancelled_jobs + 1
        WHERE id = NEW.provider_id;
    END IF;
END$$

-- T6: Auto-create chat room when booking is accepted
CREATE TRIGGER trg_booking_accepted_chat
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_provider_user_id BIGINT UNSIGNED;
    IF NEW.status = 'accepted' AND OLD.status = 'requested' THEN
        SELECT user_id INTO v_provider_user_id
        FROM providers WHERE id = NEW.provider_id LIMIT 1;

        INSERT IGNORE INTO chats (booking_id, user_id, provider_user_id)
        VALUES (NEW.id, NEW.user_id, v_provider_user_id);
    END IF;
END$$

-- T7: Increment helpful_count when vote added
CREATE TRIGGER trg_review_helpful_inc
AFTER INSERT ON review_helpful_votes
FOR EACH ROW
BEGIN
    UPDATE reviews SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
END$$

-- T8: Decrement helpful_count when vote removed
CREATE TRIGGER trg_review_helpful_dec
AFTER DELETE ON review_helpful_votes
FOR EACH ROW
BEGIN
    UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
END$$

-- T9: Keep users.wallet_balance in sync
CREATE TRIGGER trg_wallet_sync_balance
AFTER INSERT ON wallet_transactions
FOR EACH ROW
BEGIN
    UPDATE users SET wallet_balance = NEW.balance_after
    WHERE id = NEW.user_id;
END$$

-- T10: Keep users.loyalty_points in sync
CREATE TRIGGER trg_loyalty_sync_balance
AFTER INSERT ON user_loyalty_points
FOR EACH ROW
BEGIN
    UPDATE users SET loyalty_points = NEW.balance_after
    WHERE id = NEW.user_id;
END$$

DELIMITER ;

-- =============================================================
-- VIEWS
-- =============================================================

-- V1: Active providers with full profile summary
CREATE OR REPLACE VIEW vw_provider_summary AS
SELECT
    p.id                        AS provider_id,
    u.id                        AS user_id,
    u.full_name,
    u.phone,
    u.avatar_url,
    p.bio,
    p.avg_rating,
    p.total_reviews,
    p.total_completed_jobs,
    p.response_rate,
    p.avg_response_minutes,
    p.service_radius_km,
    p.lat,
    p.lng,
    p.availability_status,
    p.trust_score,
    p.is_featured,
    u.status                    AS account_status,
    p.profile_approved_at
FROM providers p
JOIN users u ON p.user_id = u.id
WHERE u.status = 'active'
  AND u.deleted_at IS NULL
  AND p.profile_approved_at IS NOT NULL;

-- V2: Booking + payment + earnings summary (admin use)
CREATE OR REPLACE VIEW vw_booking_financials AS
SELECT
    b.id                AS booking_id,
    b.booking_ref,
    b.status,
    b.scheduled_at,
    b.final_price,
    b.platform_fee,
    pay.method          AS payment_method,
    pay.status          AS payment_status,
    pay.escrow_status,
    e.net_amount        AS provider_net,
    e.status            AS earning_status,
    cu.full_name        AS customer_name,
    pu.full_name        AS provider_name
FROM bookings b
LEFT JOIN payments pay ON b.id = pay.booking_id
LEFT JOIN earnings e   ON b.id = e.booking_id
JOIN users cu          ON b.user_id = cu.id
JOIN providers pr      ON b.provider_id = pr.id
JOIN users pu          ON pr.user_id = pu.id;

-- V3: Provider earnings dashboard
CREATE OR REPLACE VIEW vw_provider_earnings AS
SELECT
    p.id                AS provider_id,
    u.full_name,
    COUNT(e.id)         AS total_jobs,
    COALESCE(SUM(e.gross_amount), 0) AS total_gross,
    COALESCE(SUM(e.net_amount), 0)   AS total_net,
    COALESCE(SUM(CASE WHEN e.status = 'available' THEN e.net_amount ELSE 0 END), 0) AS available_balance,
    COALESCE(SUM(CASE WHEN e.status = 'withdrawn' THEN e.net_amount ELSE 0 END), 0) AS total_withdrawn
FROM providers p
JOIN users u ON p.user_id = u.id
LEFT JOIN earnings e ON p.id = e.provider_id
GROUP BY p.id, u.full_name;

-- V4: Review & sentiment stats per provider
CREATE OR REPLACE VIEW vw_provider_review_stats AS
SELECT
    pr.id               AS provider_id,
    COUNT(r.id)         AS review_count,
    ROUND(AVG(r.rating), 2)          AS avg_rating,
    ROUND(AVG(r.sentiment_score), 3) AS avg_sentiment,
    SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five_star,
    SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS four_star,
    SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS three_star,
    SUM(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) AS low_star,
    SUM(r.is_flagged)   AS flagged_reviews
FROM providers pr
JOIN bookings b  ON pr.id = b.provider_id
JOIN reviews r   ON b.id  = r.booking_id
WHERE r.reviewer_role = 'customer'
GROUP BY pr.id;

-- V5: Platform-wide admin analytics snapshot
CREATE OR REPLACE VIEW vw_platform_analytics AS
SELECT
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL)                      AS total_users,
    (SELECT COUNT(*) FROM providers WHERE profile_approved_at IS NOT NULL)     AS total_providers,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed')                 AS completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'requested')                 AS pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'disputed')                  AS disputed_bookings,
    (SELECT COALESCE(SUM(platform_fee),0) FROM payments WHERE status='captured') AS total_revenue_pkr,
    (SELECT COUNT(*) FROM disputes WHERE status = 'open')                      AS open_disputes,
    (SELECT COUNT(*) FROM reports WHERE status = 'pending')                    AS pending_reports;

-- =============================================================
-- STORED PROCEDURES
-- =============================================================

DELIMITER $$

-- SP1: Release escrow for a completed booking
CREATE PROCEDURE sp_release_escrow(IN p_booking_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_payment_id BIGINT UNSIGNED DEFAULT NULL;
    DECLARE v_net_amount DECIMAL(12,2)   DEFAULT 0;

    START TRANSACTION;

    SELECT id, provider_payout
    INTO v_payment_id, v_net_amount
    FROM payments
    WHERE booking_id = p_booking_id
      AND escrow_status = 'held'
      AND status = 'captured'
    FOR UPDATE;

    IF v_payment_id IS NOT NULL THEN
        UPDATE payments
        SET escrow_status = 'released',
            escrow_released_at = NOW()
        WHERE id = v_payment_id;

        UPDATE earnings
        SET status = 'available',
            available_at = NOW()
        WHERE booking_id = p_booking_id;

        COMMIT;
    ELSE
        ROLLBACK;
    END IF;
END$$

-- SP2: Validate and apply a promo code to a booking
CREATE PROCEDURE sp_apply_promo(
    IN  p_promo_code    VARCHAR(30),
    IN  p_user_id       BIGINT UNSIGNED,
    IN  p_booking_id    BIGINT UNSIGNED,
    IN  p_booking_value DECIMAL(10,2),
    OUT p_discount      DECIMAL(10,2),
    OUT p_error         VARCHAR(200)
)
BEGIN
    DECLARE v_promo_id      INT UNSIGNED DEFAULT NULL;
    DECLARE v_dtype         VARCHAR(20);
    DECLARE v_dvalue        DECIMAL(10,2);
    DECLARE v_max           DECIMAL(10,2);
    DECLARE v_min           DECIMAL(10,2);
    DECLARE v_uses          INT;
    DECLARE v_max_uses      INT;
    DECLARE v_user_uses     INT DEFAULT 0;
    DECLARE v_max_user      INT;

    SET p_discount = 0;
    SET p_error = NULL;

    SELECT id, discount_type, discount_value, max_discount_pkr,
           min_booking_value, used_count, max_uses, max_uses_per_user
    INTO v_promo_id, v_dtype, v_dvalue, v_max, v_min,
         v_uses, v_max_uses, v_max_user
    FROM promo_codes
    WHERE code = p_promo_code
      AND is_active = 1
      AND valid_from <= NOW()
      AND valid_until >= NOW()
    LIMIT 1;

    IF v_promo_id IS NULL THEN
        SET p_error = 'Invalid or expired promo code';
    ELSEIF v_max_uses IS NOT NULL AND v_uses >= v_max_uses THEN
        SET p_error = 'Promo code usage limit reached';
    ELSEIF p_booking_value < v_min THEN
        SET p_error = CONCAT('Minimum booking value is PKR ', v_min);
    ELSE
        SELECT COUNT(*) INTO v_user_uses
        FROM promo_code_usages
        WHERE promo_id = v_promo_id AND user_id = p_user_id;

        IF v_user_uses >= v_max_user THEN
            SET p_error = 'You have already used this promo code';
        ELSE
            IF v_dtype = 'percentage' THEN
                SET p_discount = ROUND(p_booking_value * v_dvalue / 100, 2);
                IF v_max IS NOT NULL AND p_discount > v_max THEN
                    SET p_discount = v_max;
                END IF;
            ELSE
                SET p_discount = LEAST(v_dvalue, p_booking_value);
            END IF;

            INSERT INTO promo_code_usages
                (promo_id, user_id, booking_id, discount_applied)
            VALUES
                (v_promo_id, p_user_id, p_booking_id, p_discount);

            UPDATE promo_codes
            SET used_count = used_count + 1
            WHERE id = v_promo_id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- =============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- =============================================================
-- TASKIT SCHEMA SUMMARY
-- Tables        : 38
-- Triggers      : 9
-- Views         : 5
-- Procedures    : 2
-- Seed data     : badges, subscription plans, platform settings
-- =============================================================
