-- iCore MySQL bootstrap script (MySQL 8+)
-- 1) DB 생성
CREATE DATABASE IF NOT EXISTS icore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE icore;

-- 2) 랜딩 템플릿
CREATE TABLE IF NOT EXISTS landing_templates (
  id VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(240) NOT NULL,
  preview_style VARCHAR(120) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) 랜딩 페이지
CREATE TABLE IF NOT EXISTS landing_pages (
  id VARCHAR(36) NOT NULL,
  template_id VARCHAR(80) NOT NULL,
  business_topic VARCHAR(120) NOT NULL,
  business_name VARCHAR(120) NOT NULL,
  major_categories TEXT NOT NULL,
  minor_categories TEXT NOT NULL,
  slug VARCHAR(120) NOT NULL,
  url VARCHAR(500) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  retention_days INT NOT NULL DEFAULT 30,
  expires_at DATETIME(6) NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at DATETIME(6) NULL,
  custom_domain VARCHAR(240) NULL,
  title VARCHAR(120) NOT NULL,
  subtitle VARCHAR(240) NOT NULL,
  body TEXT NOT NULL,
  cta_text VARCHAR(60) NOT NULL,
  cta_url VARCHAR(240) NOT NULL,
  hero_image_url VARCHAR(500) NULL,
  primary_color VARCHAR(7) NOT NULL,
  secondary_color VARCHAR(7) NOT NULL,
  background_color VARCHAR(7) NOT NULL,
  deployed_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_landing_pages_slug (slug),
  KEY ix_landing_pages_business_topic (business_topic),
  KEY ix_landing_pages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) 스크래퍼 설정
CREATE TABLE IF NOT EXISTS scraper_configs (
  id INT NOT NULL AUTO_INCREMENT,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  schedule_mode VARCHAR(20) NOT NULL DEFAULT 'daily',
  notify_time TIME NOT NULL,
  interval_minutes INT NOT NULL DEFAULT 60,
  dedup_mode VARCHAR(40) NOT NULL DEFAULT 'notice_id',
  dedup_retention_hours INT NOT NULL DEFAULT 48,
  receiver_emails TEXT NOT NULL,
  keywords TEXT NOT NULL,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) 관리자 사용자
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password_salt VARCHAR(64) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  KEY ix_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) 기본 데이터
INSERT INTO landing_templates (id, name, description, preview_style)
SELECT 'clean-campaign', 'Clean Campaign', '교육/설명형 랜딩에 맞는 심플한 구성', 'left-copy-right-cta'
WHERE NOT EXISTS (SELECT 1 FROM landing_templates WHERE id = 'clean-campaign');

INSERT INTO landing_templates (id, name, description, preview_style)
SELECT 'dark-product', 'Dark Product', '기술/솔루션 소개에 맞는 다크 톤 구성', 'hero-centered-strong-cta'
WHERE NOT EXISTS (SELECT 1 FROM landing_templates WHERE id = 'dark-product');

INSERT INTO landing_templates (id, name, description, preview_style)
SELECT 'event-highlight', 'Event Highlight', '모집/행사 공지에 맞는 카드형 구성', 'headline-benefits-action'
WHERE NOT EXISTS (SELECT 1 FROM landing_templates WHERE id = 'event-highlight');

INSERT INTO scraper_configs (
  enabled,
  schedule_mode,
  notify_time,
  interval_minutes,
  dedup_mode,
  dedup_retention_hours,
  receiver_emails,
  keywords
)
SELECT 1, 'daily', '09:00:00', 60, 'notice_id', 48, 'admin@icore.local', '클라우드,AI,교육'
WHERE NOT EXISTS (SELECT 1 FROM scraper_configs);

-- 7) 관리자 계정 생성 (원하는 비밀번호로 변경)
-- 앱 검증식: SHA2(CONCAT(password_salt, ':', plain_password), 256)
SET @admin_username = 'admin';
SET @admin_password = 'admin123!';
SET @admin_salt = SUBSTRING(REPLACE(UUID(), '-', ''), 1, 32);

INSERT INTO users (username, password_salt, password_hash, role, is_active)
SELECT
  @admin_username,
  @admin_salt,
  SHA2(CONCAT(@admin_salt, ':', @admin_password), 256),
  'admin',
  1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = @admin_username);
