# DB 설계 (VM 내부 MySQL 기준)

## 1) landing_pages
- `id` UUID PK
- `template_id` VARCHAR(50) NOT NULL
- `business_topic` VARCHAR(100) NOT NULL
- `business_name` VARCHAR(150) NOT NULL
- `slug` VARCHAR(120) UNIQUE NOT NULL
- `custom_domain` VARCHAR(255)
- `title` VARCHAR(120) NOT NULL
- `subtitle` VARCHAR(240) NOT NULL
- `body` TEXT NOT NULL
- `cta_text` VARCHAR(60) NOT NULL
- `cta_url` VARCHAR(255) NOT NULL
- `url` VARCHAR(500) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT now()

## 2) landing_templates
- `id` VARCHAR(80) PK
- `name` VARCHAR(120) NOT NULL
- `description` VARCHAR(240) NOT NULL
- `preview_style` VARCHAR(120) NOT NULL

## 3) scraper_configs
- `id` INT PK AUTO_INCREMENT
- `enabled` BOOLEAN NOT NULL
- `notify_times` TEXT NOT NULL (comma-separated HH:MM:SS)
- `receiver_emails` TEXT NOT NULL (comma-separated)
- `keywords` TEXT NOT NULL (comma-separated)
- `updated_at` TIMESTAMP NOT NULL DEFAULT now()

## 4) scraper_runs
- `id` INT PK AUTO_INCREMENT
- `run_id` VARCHAR(64) UNIQUE NOT NULL
- `source` VARCHAR(20) NOT NULL (`cloud_run`)
- `status` VARCHAR(20) NOT NULL (`success`/`partial`/`failed`)
- `keyword_count` INT NOT NULL
- `notice_count` INT NOT NULL
- `deduped_count` INT NOT NULL
- `email_sent_count` INT NOT NULL
- `sheet_written_count` INT NOT NULL
- `error_message` TEXT NULL
- `executed_at` DATETIME(6) NOT NULL
- `created_at` DATETIME(6) NOT NULL

## 5) scraper_notices
- `id` INT PK AUTO_INCREMENT
- `dedup_key` VARCHAR(190) UNIQUE NOT NULL
- `notice_id` VARCHAR(160) NOT NULL
- `title` VARCHAR(500) NOT NULL
- `agency` VARCHAR(240) NULL
- `estimated_price` VARCHAR(120) NULL
- `published_at` DATETIME(6) NULL
- `deadline_at` DATETIME(6) NULL
- `notice_url` VARCHAR(600) NULL
- `first_seen_at` DATETIME(6) NOT NULL
- `last_seen_at` DATETIME(6) NOT NULL
- `last_run_id` VARCHAR(64) NULL

## 6) users
- `id` INT PK AUTO_INCREMENT
- `username` VARCHAR(100) UNIQUE NOT NULL
- `password_salt` VARCHAR(64) NOT NULL
- `password_hash` VARCHAR(128) NOT NULL
- `role` VARCHAR(30) NOT NULL
- `is_active` BOOLEAN NOT NULL
- `created_at` DATETIME(6) NOT NULL
- `updated_at` DATETIME(6) NOT NULL
