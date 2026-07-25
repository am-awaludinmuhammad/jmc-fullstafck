/*
  Warnings:

  - You are about to alter the column `hadir` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.
  - You are about to alter the column `cuti` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.
  - You are about to alter the column `kuota_cuti` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.
  - You are about to alter the column `izin` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.
  - You are about to alter the column `kuota_izin` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.
  - You are about to alter the column `unpaid_leave` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.
  - You are about to alter the column `kuota_unpaid_leave` on the `attendance_summaries` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.

*/
-- AlterTable
ALTER TABLE `attendance_summaries` MODIFY `hadir` DECIMAL(4, 1) NOT NULL,
    MODIFY `cuti` DECIMAL(4, 1) NOT NULL,
    MODIFY `kuota_cuti` DECIMAL(4, 1) NOT NULL,
    MODIFY `izin` DECIMAL(4, 1) NOT NULL,
    MODIFY `kuota_izin` DECIMAL(4, 1) NOT NULL,
    MODIFY `unpaid_leave` DECIMAL(4, 1) NOT NULL,
    MODIFY `kuota_unpaid_leave` DECIMAL(4, 1) NOT NULL;
