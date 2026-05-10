DROP TRIGGER IF EXISTS trg_users_referral;

DELIMITER $$

CREATE TRIGGER trg_users_referral
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        SET NEW.referral_code = UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8));
    END IF;
END$$

DELIMITER ;

ALTER TABLE users MODIFY referral_code VARCHAR(20) NULL;