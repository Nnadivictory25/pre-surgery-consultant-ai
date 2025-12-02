<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<!-- Medical Emoji Favicon -->
	<link
		rel="icon"
		href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥‍⚕️</text></svg>"
	/>

	<!-- SEO Meta Tags -->
	<meta
		name="description"
		content="Get personalized pre-surgery consultation and preparation guidance from AI. Expert advice on what to expect, dietary restrictions, and recovery tips."
	/>
	<meta
		name="keywords"
		content="pre-surgery consultation, surgery preparation, medical advice, AI doctor assistant, surgical guidance, recovery tips"
	/>
	<meta name="author" content="Pre-Surgery Consultant AI" />

	<!-- Open Graph -->
	<meta property="og:title" content="Pre-Surgery Consultant AI" />
	<meta
		property="og:description"
		content="Get personalized pre-surgery consultation and preparation guidance from AI. Expert advice on what to expect, dietary restrictions, and recovery tips."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://pre-surgery-ai.viclabs.dev" />
	<meta property="og:site_name" content="Pre-Surgery Consultant AI" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Pre-Surgery Consultant AI" />
	<meta
		name="twitter:description"
		content="Get personalized pre-surgery consultation and preparation guidance from AI. Expert advice on what to expect, dietary restrictions, and recovery tips."
	/>
	<meta name="twitter:site" content="@PreSurgeryAI" />

	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en" />
	<meta name="theme-color" content="#0f172a" />
</svelte:head>

{@render children()}
