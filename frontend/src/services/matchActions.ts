import { API_URL } from "./config";

/* Create this object + call the saveMatch function for each type of match.
type:
1v1 -> "1v1 Match"
Tournament -> "Tournament Match"
AI  -> "AI Match"

player:
when a player is guest OR AI, their id must be "null"

if we implement the websocket we have to be careful not to save 1 match once.
Solution -> the user with the highest id is the one saving.

Recommendations:
- using this function after GameStop() (I couldnt implement it myself because players are missing)
- launching initGame with the type of game that is being played, so that it can be passed
*/

export interface MatchObject
{
	type: string,
	date: string,
	player1Id?: number | null,
	player2Id?: number | null,
	player1Score: number,
	player2Score: number,
}

export async function saveMatch(match: any)
{
	const token = localStorage.getItem("token");

	const res = await fetch(`${API_URL}/users/me`,
	{
		method: "POST",
		headers:
		{
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify(
		{
			action: "create_match",
			matchData: match
		})
	});

	if (!res.ok) throw new Error("Failed to save match");
		return res.json();
}
