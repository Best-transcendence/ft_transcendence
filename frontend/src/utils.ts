// Formats ISO dates to DD/MM/YYY + HH:MM:SS depending on timePrecision flag used
export function formatDate(dateString: string, timePrecision: string)
{
	const date = new Date(dateString);

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() +1).padStart(2, "0");
	const year = date.getFullYear();

	let time = "";

	switch (timePrecision)
	{
		case "S": {
			const sec = String(date.getSeconds()).padStart(2, "0");
			 time = `:${sec}`;
		}

		case "M": {
			const min = String(date.getMinutes()).padStart(2, "0");
			time = `:${min}` + time;
		}

		case "H": {
			const hour = String(date.getHours()).padStart(2, "0");
			if (time == "")
				time = "h";
			time = ` - ${hour}` + time;
		}

		default:
			break;
	}

	return `${day}/${month}/${year}${time}`;
}

// Calculates a duration (ex. can be use for match statistics)
export function formatDuration(startString: string, endString: string)
{
	const startdate = new Date(startString);
	const enddate = new Date(endString);

	const durationMs = enddate.getTime() - startdate.getTime();

	const seconds = Math.floor(durationMs / 1000) % 60;
	const minutes = Math.floor(durationMs / (1000 * 60) % 60);
	const hours = Math.floor(durationMs / (1000 * 60 * 60));

	return `${hours}h ${minutes}m ${seconds}s`;
}
