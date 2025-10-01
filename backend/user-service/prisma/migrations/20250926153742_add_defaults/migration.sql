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
    "bio" TEXT NOT NULL DEFAULT 'Hi, I''m playing Arcade Clash',
    "matchHistory" JSONB,
    "stats" JSONB
);
INSERT INTO "new_UserProfile" ("authUserId", "bio", "createdAt", "email", "id", "matchHistory", "name", "profilePicture", "stats", "updatedAt") SELECT "authUserId", coalesce("bio", 'Hi, I''m playing Arcade Clash') AS "bio", "createdAt", "email", "id", "matchHistory", "name", coalesce("profilePicture", '/assets/default-avatar.jpeg') AS "profilePicture", "stats", "updatedAt" FROM "UserProfile";
DROP TABLE "UserProfile";
ALTER TABLE "new_UserProfile" RENAME TO "UserProfile";
CREATE UNIQUE INDEX "UserProfile_authUserId_key" ON "UserProfile"("authUserId");
CREATE UNIQUE INDEX "UserProfile_name_key" ON "UserProfile"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
