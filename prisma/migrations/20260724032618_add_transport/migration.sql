-- CreateTable
CREATE TABLE `transport_allowance_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `base_fare` DECIMAL(10, 2) NOT NULL,
    `effective_start` DATE NOT NULL,
    `min_km` DECIMAL(6, 2) NOT NULL,
    `max_km` DECIMAL(6, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_allowance_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NOT NULL,
    `total_recipients` INTEGER NOT NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL,
    `status` ENUM('draft', 'calculated', 'locked') NOT NULL,
    `calculated_by` INTEGER NULL,
    `calculated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transport_allowance_periods_period_year_period_month_key`(`period_year`, `period_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_allowance_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transport_allowance_period_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,
    `base_fare` DECIMAL(10, 2) NOT NULL,
    `original_km` DECIMAL(6, 2) NOT NULL,
    `rounded_km` DECIMAL(6, 2) NOT NULL,
    `attendance_days` INTEGER NOT NULL,
    `nominal` DECIMAL(14, 2) NOT NULL,
    `eligibility_status` VARCHAR(191) NOT NULL,
    `calculation_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transport_allowance_details_transport_allowance_period_id_em_key`(`transport_allowance_period_id`, `employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transport_allowance_settings` ADD CONSTRAINT `transport_allowance_settings_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_allowance_periods` ADD CONSTRAINT `transport_allowance_periods_calculated_by_fkey` FOREIGN KEY (`calculated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_allowance_details` ADD CONSTRAINT `transport_allowance_details_transport_allowance_period_id_fkey` FOREIGN KEY (`transport_allowance_period_id`) REFERENCES `transport_allowance_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_allowance_details` ADD CONSTRAINT `transport_allowance_details_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
