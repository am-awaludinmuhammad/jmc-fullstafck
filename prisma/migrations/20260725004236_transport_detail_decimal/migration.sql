/*
  Warnings:

  - You are about to alter the column `attendance_days` on the `transport_allowance_details` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(4,1)`.

*/
-- AlterTable
ALTER TABLE `transport_allowance_details` MODIFY `attendance_days` DECIMAL(4, 1) NOT NULL;
