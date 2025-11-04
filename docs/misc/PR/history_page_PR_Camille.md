**MAIN IMPLEMENTATIONS:**
- Added a Match table in the db
- Created the History page
- Created token calls for you guys to use in your game pages to send the game info

**Note1:** I recommend running `npx prisma migrate reset` then `npm run seed` in the `backend/user-service` for most updated experience.

**Note 2:** There are still things left to do -> I've added them to the project tickets

**Note 3:** Somehow at the time I'm doing this PR, it's showing me differences from what seems to be the `develop` branch before the 2 merges of today were done. I've tried to rebase and got the same result, hopefully that's no longer the case when you'll review - but if you see files such as `FriendRequestDiv`, chances are you're in the same state as me.

**Note 4:** (the last one I promise): I am SO sorry I just realised that I didn't respect the Capital letter naming conventions, and the lint is not working on my end. I apologise that this is giving you guys more work :/

**CHANGES:**:
**1. `backend/user-service/prisma/migrations/20251005105838_add_match_table/migration.sql` and `backend/user-service/prisma/migrations/20251005180213_make_player_relations_nullable/migration.sql`**
- Prisma tracker of changes in the db


**2. `backend/user-service/prisma/schema.prisma`**
- Added the match table + connections between matches and players


**3. `backend/user-service/prisma/seed.js`**
- Added matches to display
- Removed unused fields from user profiles


**4. `backend/user-service/routes/users.js`**
- Added matches to GET/POST of `users/me` endpoints


**5. `frontend/public/assets`**
- added default pictures for guests (as in when we play pong normally, from the same keyboard)
- added default pictures for AI
- added default pictures for camille user


**6. `frontend/public/output.css`**
- Automatic update on values used, done with `tailwind:build`


**7. `frontend/src/components/MatchDiv.ts`**
- `noHistory()` -> has a button to #intro page
- `matchCard()` -> contains the match info, calls the card creation for each player
- `playerCard()` -> creates card for each player, tweaking parameters such as win/lose/draw status, display of 'Befriend' button
- `getWinner()` -> determines winner and checks what current player's status is, sending the appropriate display
- `checkFriendCondition()` -> checks if conditions to display 'Befriend' button are applicable
- `getSpecialPlayer()` - fills up info to be displayed for Guest or AI player


**8. `frontend/src/components/SideBar.ts`**
- Added Match History page


**10. `frontend/src/components/Timer.ts` and `frontend/src/games/InitGame.ts`**
- imported the functions to save Match into backend for later use


**11. `frontend/src/pages/HistoryPage.ts`**
- Handles history page and transitions between match cards
- `loadMatches()` -> loads the current match or the `noHistory()` display if applicable
- `slideMatches()` -> Handles arrow clicking and transition fade
- `matchesEvents` -> Handles all click events of the page
- `leftArrow()` -> left arrow appearance
- `rightArrow()` -> right arrow appearance
- `HistoryPage()` -> history page appearance


**12. `frontend/src/router.ts`**
- Added the call for "history" page case (`protectedPage(() => HistoryPage(), matchesEvents);)`


**13. `frontend/src/services/matchActions.ts`**
- Dedicated to sending match elements to the user service backend
- `MatchObject` -> interface dictating what should be sent to the `saveMatch()` function
- `saveMatch()` -> sends request to action `create_match`
