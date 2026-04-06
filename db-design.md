# DB 설계 초안 (VM 내부 MySQL 기준)

## 1) business_sites
- `id` UUID PK
- `topic` VARCHAR(100) NOT NULL
- `name` VARCHAR(150) NOT NULL
- `url` VARCHAR(255) NOT NULL
- `status` VARCHAR(20) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT now()

## 2) landing_pages
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
- `storage_path` VARCHAR(255) NOT NULL
- `public_url` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT now()

## 3) scraper_configs
- `id` UUID PK
- `enabled` BOOLEAN NOT NULL
- `notify_time` TIME NOT NULL
- `receiver_email` VARCHAR(255) NOT NULL
- `keywords` TEXT[] NOT NULL
- `updated_at` TIMESTAMP NOT NULL DEFAULT now()

## 4) users / roles (확장 예정)
- `users(id, email, name, status, created_at)`
- `roles(id, role_name)`
- `user_roles(user_id, role_id)`
