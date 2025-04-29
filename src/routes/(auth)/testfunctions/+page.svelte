<script lang="ts">
	import Pub from '$lib/components/Pub.svelte';
	import { addToCart, refreshCart } from '$lib/controls.svelte';
	import { Button } from 'carbon-components-svelte';
	let publications = [
		{
			fileUrl:
				'https://unctad.org/publication/empretec-women-business-building-purpose-driven-enterprises-amid-crises',
			title: 'Empretec Women in Business: Building purpose-driven enterprises amid crises',
			code: 'UNCTAD/DIAE/ED/2022/1',
			datePublished: '21 Nov 2022',
			imageUrl: 'https://yrka.org/gir37'
		},
		{
			fileUrl: 'https://unctad.org/publication/empretec-women-business-awards-2020',
			title: 'Empretec Women in Business Awards 2020',
			code: 'UNCTAD/DIAE/ED/2020/1',
			datePublished: '2 Nov 2020',
			imageUrl: 'https://yrka.org/en8kq'
		},
		{
			fileUrl: 'https://unctad.org/publication/empretec-women-business-awards-2018',
			title: 'Empretec Women in Business Awards 2018',
			code: 'UNCTAD/DIAE/ED/2018/1',
			datePublished: '15 Oct 2018',
			imageUrl: 'https://yrka.org/yrxzb'
		},
		{
			fileUrl: 'https://unctad.org/publication/policy-guide-youth-entrepreneurship',
			title: 'Policy Guide on Youth Entrepreneurship',
			code: 'UNCTAD/DIAE/ED/2015/1',
			datePublished: '24 Nov 2015',
			imageUrl: 'https://yrka.org/6zxtb'
		},
		{
			fileUrl: 'https://unctad.org/publication/empretec-women-business-awards-2014',
			title: 'Empretec Women in Business Awards 2014',
			code: 'UNCTAD/DIAE/ED/2014/3',
			datePublished: '1 Dec 2014',
			imageUrl: 'https://yrka.org/d4vn3'
		},
		{
			fileUrl: 'https://unctad.org/publication/empretec-women-business-awards-2012',
			title: 'Empretec Women in Business Awards 2012',
			code: 'UNCTAD/DIAE/ED/2012/5',
			datePublished: '1 Dec 2012',
			imageUrl: ''
		}
	];
</script>

<Button
	on:click={async () => {
		await addToCart('dd0d65vf0pfyzua', 1);
		await refreshCart();
	}}
	>Add to cart !
</Button>

<div>
	<Pub />
</div>
