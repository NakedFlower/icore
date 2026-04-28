-- Remove legacy hero image support from landing_pages.
-- Run this against the icore database to drop the hero_image_url column.

USE icore;

ALTER TABLE landing_pages 
DROP COLUMN hero_image_url;
