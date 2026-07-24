-- CreateTable
CREATE TABLE `attendance_imports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `original_filename` VARCHAR(191) NOT NULL,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NOT NULL,
    `status` ENUM('queued', 'processing', 'completed', 'failed') NOT NULL,
    `total_rows` INTEGER NOT NULL,
    `processed_rows` INTEGER NOT NULL,
    `error_message` TEXT NULL,
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `attendance_import_id` INTEGER NULL,
    `attendance_date` DATE NOT NULL,
    `checkin_at` DATETIME(3) NULL,
    `checkout_at` DATETIME(3) NULL,
    `checkin_location` VARCHAR(191) NULL,
    `checkout_location` VARCHAR(191) NULL,
    `attendance_type` ENUM('hadir', 'cuti', 'izin', 'unpaid_leave') NOT NULL,
    `duration_hours` DECIMAL(5, 2) NULL,
    `status` ENUM('terpenuhi', 'tidak_terpenuhi') NOT NULL,
    `verification_status` VARCHAR(191) NOT NULL,
    `verified_by_role` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendances_employee_id_attendance_date_key`(`employee_id`, `attendance_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_summaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NOT NULL,
    `hadir` INTEGER NOT NULL,
    `cuti` INTEGER NOT NULL,
    `kuota_cuti` INTEGER NOT NULL,
    `izin` INTEGER NOT NULL,
    `kuota_izin` INTEGER NOT NULL,
    `unpaid_leave` INTEGER NOT NULL,
    `kuota_unpaid_leave` INTEGER NOT NULL,
    `status_hadir` VARCHAR(191) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendance_summaries_employee_id_period_year_period_month_key`(`employee_id`, `period_year`, `period_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attendance_imports` ADD CONSTRAINT `attendance_imports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_attendance_import_id_fkey` FOREIGN KEY (`attendance_import_id`) REFERENCES `attendance_imports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_summaries` ADD CONSTRAINT `attendance_summaries_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
