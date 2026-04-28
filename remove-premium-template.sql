-- Remove legacy premium bootcamp template records and migrate existing pages to a supported template.
-- Run this against the iCore database after backing up your data.

UPDATE landing_pages
SET template_id = 'clean-campaign'
WHERE template_id = 'template4-premium-bootcamp';

DELETE FROM landing_templates
WHERE id = 'template4-premium-bootcamp';
