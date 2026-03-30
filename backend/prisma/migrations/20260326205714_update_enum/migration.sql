/*
  Warnings:

  - The values [MeowVentLoop] on the enum `GameType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

-- 1. Создаём новый тип с новыми значениями
CREATE TYPE "GameType_new" AS ENUM ('mergeGame', 'decrypto', 'eventLoop', 'hangman', 'citiesGame');

-- 2. Конвертируем колонку, заменяя старое значение на новое
ALTER TABLE "game_statistic" 
  ALTER COLUMN "gameType" 
  TYPE "GameType_new" 
  USING (
    CASE 
      WHEN "gameType"::text = 'MeowVentLoop' THEN 'eventLoop'::"GameType_new"
      ELSE "gameType"::text::"GameType_new"
    END
  );

-- 3. Переименовываем типы
ALTER TYPE "GameType" RENAME TO "GameType_old";
ALTER TYPE "GameType_new" RENAME TO "GameType";

-- 4. Удаляем старый тип
DROP TYPE "public"."GameType_old";

COMMIT;