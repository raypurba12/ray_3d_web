-- AlterTable
ALTER TABLE `users` ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `refresh_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `familyId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `replacedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_sessions_tokenHash_key`(`tokenHash`),
    INDEX `refresh_sessions_userId_revokedAt_idx`(`userId`, `revokedAt`),
    INDEX `refresh_sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `experiences_order_idx` ON `experiences`(`order`);

-- CreateIndex
CREATE INDEX `gallery_images_order_idx` ON `gallery_images`(`order`);

-- CreateIndex
CREATE INDEX `page_views_createdAt_visitorId_idx` ON `page_views`(`createdAt`, `visitorId`);

-- CreateIndex
CREATE INDEX `projects_featured_order_idx` ON `projects`(`featured`, `order`);

-- CreateIndex
CREATE INDEX `technologies_order_idx` ON `technologies`(`order`);

-- CreateIndex
CREATE INDEX `testimonials_featured_order_idx` ON `testimonials`(`featured`, `order`);

-- AddForeignKey
ALTER TABLE `refresh_sessions` ADD CONSTRAINT `refresh_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
