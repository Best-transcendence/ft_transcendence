- user-service: schema.prisma: model Stats

- remove stats: profile.stats from seed.js: from async functino main()
        friends: profile.friends || {}, //import profile.friends or empty object
        // stats: profile.stats


- CREATE TABLE UserProfile, migration sql deleted:
upsert means:

“Update if it exists, otherwise insert (create) a new one.”

So it’s safe — it won’t duplicate or throw an error if a Stats row already exists.

    "matchHistory" JSONB,
    "stats" JSONB

	// 
	const users = await prisma.userProfile.findMany({ select: { id: true } });
	for (const u of users) {
	await prisma.stats.upsert({
		where: { userId: u.id },
		update: {},
		create: { userId: u.id }, // defaults (0s)
	});
	}

- suggestion applied for the intro page to be aligned with the website style

- lobby page: // small cache + helper to get the user name

const EMOJIS = ['⚡','🚀','🐉','🦊','🐱','🐼','🐧','🐸','🦄','👾','⭐','🌟','🍀'];
function emojiForId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return EMOJIS[h % EMOJIS.length];
}


- async

export async function initLobby() {
  const token = localStorage.getItem("jwt");

  if (!token) {
    window.location.hash = "login";
    return;
  }

  connectSocket(token, async (msg) => {

