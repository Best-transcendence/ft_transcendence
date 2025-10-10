 // TODO: it doesn't get the user id if it's a freshly created account


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

- lobby page: //

const EMOJIS = ['⚡','🚀','🐉','🦊','🐱','🐼','🐧','🐸','🦄','👾','⭐','🌟','🍀'];
function emojiForId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return EMOJIS[h % EMOJIS.length];
}

- filter own
	const others = msg.users.filter((u: any) => String(u?.id ?? "") !== selfId);

- async

export async function initLobby() {
  const token = localStorage.getItem("jwt");

  if (!token) {
    window.location.hash = "login";
    return;
  }


- have to save in a variable
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


- check if there another user online
  setTimeout(() => {
	if (! otherUser) {
		usersContainer.innerHTML = 'p class="text-gray-400">Nobody online yet</p>';
		}
	}, 1500);

	// actively request if there's another user once the socket is open
	try {
		socket?.addEventListener?.("open", () => {
			try { socket.send?.(JSON.stringify({type: "user:list:request"})); } catch{}
		})
	} catch {}
}

- 404 page

- 	Statistics to Dashboard		<li data-action="stats" class="cursor-pointer hover:text-purple-700">Dashboard</li>
