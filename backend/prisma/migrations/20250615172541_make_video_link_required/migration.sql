/*
  Warnings:

  - Made the column `videoLink` on table `Interview` required. This step will fail if there are existing NULL values in that column.

*/
-- Обновляем существующие NULL значения значением по умолчанию
UPDATE "Interview" SET "videoLink" = 'https://meet.google.com/placeholder' WHERE "videoLink" IS NULL;

-- AlterTable
ALTER TABLE "Interview" ALTER COLUMN "videoLink" SET NOT NULL;
