-- CreateTable
CREATE TABLE "merge_game_data" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "merge_game_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merge_game_word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "dataId" INTEGER NOT NULL,

    CONSTRAINT "merge_game_word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merge_game_question" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[],
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "merge_game_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merge_game_data_category_idx" ON "merge_game_data"("category");

-- CreateIndex
CREATE INDEX "merge_game_word_dataId_idx" ON "merge_game_word"("dataId");

-- CreateIndex
CREATE INDEX "merge_game_question_wordId_idx" ON "merge_game_question"("wordId");

-- AddForeignKey
ALTER TABLE "merge_game_word" ADD CONSTRAINT "merge_game_word_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "merge_game_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merge_game_question" ADD CONSTRAINT "merge_game_question_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "merge_game_word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
