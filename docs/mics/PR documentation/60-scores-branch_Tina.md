- better socket following, but just after the second load

- fixed invitation in the lobby

- fixed roomid for players with the right route 

- default users doesn't appear themselves for invitations (new users still do)

- user-service: schema.prisma: model Stats

- remove stats: profile.stats from seed.js: from async functino main()
        friends: profile.friends || {}, //import profile.friends or empty object
        // stats: profile.stats

- suggestion applied for the intro page to be aligned with the website style

- lobby page emoji signs for the players you can invite
const EMOJIS = ['⚡','🚀','🐉','🦊','🐱','🐼','🐧','🐸','🦄','👾','⭐','🌟','🍀'];
function emojiForId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return EMOJIS[h % EMOJIS.length];
}

- it's not going filter selfid if it's a freshly created account, but it's working on the seed ones
	const others = msg.users.filter((u: any) => String(u?.id ?? "") !== selfId);

- have to save in a variable to check the socket later 
  const socket = connectSocket(token, (msg) => {

  // Proactively request the list NOW (covers first-visit race)
  try {
    // If socket already open, send immediately
    if (socket?.readyState === 1 /* WebSocket.OPEN */) {
      socket.send?.(JSON.stringify({ type: "user:list:request" }));
    }

    // Also request once it opens (covers slower connections)
    socket?.addEventListener?.("open", () => {
      try { socket.send?.(JSON.stringify({ type: "user:list:request" })); } catch {}
    });
  } catch {}
}

- 404 page design

- Statistics named to Dashboard

- Dashboard Design

- AI Opponent
export function initGameAIOpponent(): void {
	// --- AI config (left paddle) ---
	const aiEnabled = true;       // left paddle is AI
	const aiMaxSpeed = 2.0;       // how fast the AI can move (<= your maxSpeed)
	const aiFollowStrength = 0.15; // smoothing (0..1), higher = snappier
	
	// TODO more difficult AI movements
	// target is to center the paddle on the ball
    const ballCenterY = ballY + BALL_H / 2;
    const paddleCenterY = p1Y + PADDLE_H / 2;

	 backend/user-service/prisma/migrations/20250910164408_init/migration.sql |   7 ++--
 backend/user-service/prisma/migrations/20251009205740_init/migration.sql |  13 ++++++++
 backend/user-service/prisma/schema.prisma                                |  20 ++++++++++++
 backend/user-service/prisma/seed.js                                      |  12 ++++++-
 backend/ws-service/routes/websocket.js                                   |  78 ++++++++++++++++++++++++++++++++++++++++++++
 docs/mics/PR documentation/60-scores-branch_Tina.md                      |  62 +++++++++++++++++++++++++++++++++++
 docs/mics/{ => PR documentation}/friend_PR_Camille.md                    |   0
 docs/mics/{ => PR documentation}/frontend_fixes.md                       |   0
 docs/mics/{ => PR documentation}/history_page_PR_Camille.md              |   0
 frontend/README.md                                                       |  15 +++++++--
 frontend/public/output.css                                               | 118 +++++++++++++++++++++++++++++++++++++++++++++++++-----------------
 frontend/src/components/SideBar.ts                                       |   6 ++--
 frontend/src/games/AIOpponent.ts                                         |  15 ++++++++-
 frontend/src/games/InitGameAIOpponent.ts                                 | 203 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 frontend/src/games/InitGameTournament.ts                                 | 183 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 frontend/src/pages/Dashboard.ts                                          |  91 +++++++++++++++++++++++++++++++++++++++++++++++++++
 frontend/src/pages/GameIntroPage.ts                                      |   2 +-
 frontend/src/pages/LobbyPage.ts                                          | 190 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------
 frontend/src/pages/NotFoundPage.ts                                       |  26 ++++++++++++---
 frontend/src/router.ts                                                   |  22 ++++++++++---
 20 files changed, 954 insertions(+), 109 deletions(-)