-- Align the column name with the Prisma field name.
ALTER TABLE `site_settings` CHANGE COLUMN `updated_at` `updatedAt` DATETIME(3) NOT NULL;
