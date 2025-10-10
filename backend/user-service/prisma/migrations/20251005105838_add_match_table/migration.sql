/*
  Warnings:

  - You are about to drop the column `matchHistory` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `stats` on the `UserProfile` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "player1Score" INTEGER NOT NULL,
    "player2Score" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authUserId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "profilePicture" TEXT NOT NULL DEFAULT '/assets/default-avatar.jpeg',
    "bio" TEXT NOT NULL DEFAULT 'Hi, I''m playing Arcade Clash'
);
INSERT INTO "new_UserProfile" ("authUserId", "bio", "createdAt", "email", "id", "name", "profilePicture", "updatedAt") SELECT "authUserId", "bio", "createdAt", "email", "id", "name", "profilePicture", "updatedAt" FROM "UserProfile";
DROP TABLE "UserProfile";
ALTER TABLE "new_UserProfile" RENAME TO "UserProfile";
CREATE UNIQUE INDEX "UserProfile_authUserId_key" ON "UserProfile"("authUserId");
CREATE UNIQUE INDEX "UserProfile_name_key" ON "UserProfile"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
