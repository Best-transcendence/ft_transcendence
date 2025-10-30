**MAIN IMPLEMENTATIONS**: Friends page containing a Popup for new friends request.

**In a nutshell:**
- There are 2 connection lists in the DB
- - `friends`
- - `friendOf`

I use those 2 lists to determine the mutuality of a friendship.
Ex.
- UserA doesn't have UserB in his `friend` list nor `friendOf` list => _they are not friends._
- UserA has UserB in `friend`, but not in `friendOf` => _UserA sent a friend request to UserB. UserB hasn't replied yet._
- UserA doesn't have UserB in `friend`, but has UserB in `friendOf` => _UserA has a pending friend request from UserB._
- UserA has UserB in `friend` AND in `friendOf` => _They're mutual friends!_

Note: the connections in `friendOf` are handled automatically based on any user that has Us in their `friend`
Therefore, when UserA sends a request to UserB => UserA has UserB in his `friend` list + UserB has UserA in his `friendOf` list

I've altered the seed so that each user will receive a friend request from Camille (if that doesn't show, you might want to reboot the db)

**CHANGES DONE:**
**1. backend/user-service/prisma/schema.prisma**
- Added a comment to clarify each list's purpose

**2.  backend/user-service/prisma/seed.js**
- Added friends connection to the profile creation
- Created updates on each users' friends. Everyone should get an request from Camille!

**3. backend/user-service/routes/users.js**
- Added what elements of a friend user profile are accessible from `friends` VS `friendOf` 
- - -> on the frontend, it is sine qua non for a user to be in `friendOf` to be displayed 
- - therefore we fetch friends info from `friendOf`, and only use `friends` for mutuality comparison
- Sorted by alphabetical order (not ascii)
- Created 2 friends actions:
- - `add_friend` -> adds friend to a user's friend list only -> happens when sending an invite or accepting a request
- - `remove_friend` -> removes friend from BOTH lists - breaking the link completely -> only happens after declining request or unfriending.

**4. frontend/public/output.css**
- Automatic addings from `tailwind.css`

5. **frontend/src/components/FriendRequestDiv.ts**
- Created a friend request div:
- - It pops up on Friend page launch, and only appears if the user has pending requests
- - Once all requests are dealt with, the popup disappears

**6. frontend/src/components/Popups.ts**
- Added a new popup -> `confirm-popup` -> Appears when unfriending someone.
- - Added its config in the buttonConfigs array
- - Modify the `triggerPopup()` function to accomodate for it + add a way to retrieve the id of the friend whose button has been click
- - Added the `initConfirmPopup()` function to retrieve the friend id + trigger the appropriate response for each button
- - Added `confirmPopup()` for HTML display
-  Created separate `setupInputPopup()` to try and alleviate the main function
-  Reorganised order of functions
- Changed maxlen of usernames + bio to match friendcards' space

**7. frontend/src/components/SideBar.ts**
- Added Friend page link to sidebar
- Changed "Play Pong" to "Arcade Clash"
- Change colour of hovering

**8. frontend/src/pages/Friends.ts**
- Created Friends page
- - `loadFriend()` -> checks mutuality of friendships to determine who will be displayed as friend + who will be appearing as popup request
- - `noFriends()` -> display when no friends are found
- - friendCard() -> display of friend card - THE ONLINE STATUS HAS NOT BEEN IMPLEMENTED YET - so it'll show a green dot by default
- - ` FriendsPage()` -> display of the friend page

**9. frontend/src/pages/ProfilePage.ts**
- Minor display changes to harmonize with our other pages

**10. frontend/src/router.ts**
- Altered `protectedPage()` to receive an array of rendering functions
- -> this way we don't have to add them all here even when not relevant, we can simply pass them as args with their corresponding page functions.
- Altered `router()` to call correctly the new `protectedPage()` function

**11. frontend/src/services/friendsActions.ts**
- Added function to add friends + refresh current page (any page can be sent, so that you guys can use it for friend requests!)
- Added function to remove friends