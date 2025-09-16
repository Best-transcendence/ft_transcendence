// File aimed at holding popups
import { thisUser } from "../router"
import { editProfilePicture, removeProfilePicture } from "../services/userActions"

export function profilePopUp()
{
	return `
	div id="profile-popup"
		style="display: none; position: fixed; ">
		<button id="change-pic-btn">
			Change profile picture</button>
		<button id="remove-pic-btn">
			Remove profile picture</button>
	</div>`
}
