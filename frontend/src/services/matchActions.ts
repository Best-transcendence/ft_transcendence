import { API_URL } from "./config";

/* Create this object + call the saveMatch function for each type of match.
type:
1v1 -> "ONE_VS_ONE"
Tournament Intermediate -> "TOURNAMENT_INTERMEDIATE"
Tournament Final -> "TOURNAMENT_FINAL"

player:
Only save matches between registered users. Do not save if either player is a guest.

if we implement the websocket we have to be careful not to save 1 match once.
Solution -> the user with the highest id is the one saving.

Recommendations:
- Check that both players are authenticated before calling saveMatch
- The winnerId is calculated automatically on the backend based on scores
- Use TOURNAMENT_FINAL for championship matches, TOURNAMENT_INTERMEDIATE for others
*/

export interface MatchObject
{
	type: string,
	date: string,
	player1Id: number,
	player2Id: number,
	player1Score: number,
	player2Score: number,
}

export async function saveMatch(match: any)
{
	console.log("=== SAVEMATCH DEBUG ===");
	console.log("Match data:", match);
	
	const token = localStorage.getItem("jwt");
	console.log("Token exists:", !!token);

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

	console.log("Response status:", res.status);
	console.log("Response ok:", res.ok);

	if (!res.ok) {
		const errorText = await res.text();
		console.error("Failed to save match:", errorText);
		throw new Error("Failed to save match");
	}
	
	const result = await res.json();
	console.log("Match saved successfully:", result);
	return result;
}
