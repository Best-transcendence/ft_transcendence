// src/components/CardCreator.ts

// Generic card factory.
export function createCard({
  title,
  icon,
  description,
  hash
}: {
  title: string;
  icon: string;
  description: string;
  hash: string;
}): string {
  return `
    <div class="rounded-xl shadow-[0_0_30px_10px_#7037d3]
                p-6 w-64 text-center cursor-pointer
                bg-purple-900/40
                hover:bg-purple-700
                transform
                transition-all duration-300 ease-in-out
                hover:scale-110
                mt-6"
         onclick="window.location.hash='${hash}'">

      <h2 class="font-bold text-cyan-400 mb-2
                 transition-colors duration-300 hover:text-cyan-300">
        ${icon} ${title}
      </h2>

      <p class="text-white text-sm
                transition-colors duration-300 hover:text-gray-200">
        ${description}
      </p>
    </div>
  `;
}

