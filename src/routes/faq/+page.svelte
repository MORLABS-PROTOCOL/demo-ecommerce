<script>
	const faqs = [
		{
			question: 'What is Vikstores?',
			answer: 'Vikstores is an online platform for managing and showcasing your store products.'
		},
		{
			question: 'How do I create an account?',
			answer: 'Click on the Sign Up button and fill in your details to create an account.'
		},
		{
			question: 'Is there a subscription fee?',
			answer: 'No, Vikstores is free to use for all users.'
		},
		{
			question: 'How can I contact support?',
			answer:
				'You can contact support via the Contact Us page or email us at support@vikstores.com.'
		}
	];
</script>

<div
	class="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
>
	<h1 class="text-3xl md:text-4xl font-bold mb-8">Frequently Asked Questions</h1>
	{#each faqs as faq}
		<div class="my-6">
			<strong class="block text-lg md:text-xl font-semibold mb-2">{faq.question}</strong>
			<div class="text-base md:text-lg">{faq.answer}</div>
		</div>
	{/each}
</div>
