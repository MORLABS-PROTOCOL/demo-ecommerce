<script lang="ts">
	let { title, description, keywords } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
</svelte:head>
