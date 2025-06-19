<script>
	// You can add logic here if needed in the future
</script>

<div
	class="flex flex-col items-center justify-center min-h-[70vh] text-center rounded-xl shadow-2xl p-10 animate-fade-in"
>
	<svg
		class="w-16 h-16 mb-6 drop-shadow-lg animate-bounce"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
	<div class="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-wide">Coming Soon</div>
	<div class="text-lg text-blue-100 mb-2">
		This page is under construction.<br />
		Please check back later!
	</div>
	<div class="mt-6">
		<button
			onclick={() => (window.location.href = '/')}
			class="px-6 py-2 rounded-full bg-white text-blue-700 font-semibold shadow hover:bg-blue-100 transition duration-200"
		>
			Back to Home
		</button>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 1s ease;
	}
</style>
