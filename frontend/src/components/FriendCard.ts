
export function friendCard(friend: any)
{
	return `
	<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
		<div class="flex items-start gap-4 absolute left-5 top-5">
			<img src=${ friend.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ friend.name }
					<span class="inline-block ml-1 text-sm">🟢</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ friend.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>`;
}
