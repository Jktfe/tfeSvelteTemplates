<script>
	import CardStack from './CardStack.svelte';

	const sampleCards = [
		{
			title: 'EMAIL',
			image: 'https://via.placeholder.com/300x400/4E4E4E/FFFFFF?text=EMAIL'
		},
		{
			title: 'LINKEDIN',
			image: 'https://via.placeholder.com/300x400/0077B5/FFFFFF?text=LINKEDIN'
		},
		{
			title: 'DRIBBBLE',
			image: 'https://via.placeholder.com/300x400/EA4C89/FFFFFF?text=DRIBBBLE'
		},
		{
			title: 'SUBSTACK',
			image: 'https://via.placeholder.com/300x400/FF6D00/FFFFFF?text=SUBSTACK'
		},
		{
			title: 'PROTOTYPES',
			image: 'https://via.placeholder.com/300x400/FF6D00/FFFFFF?text=PROTOTYPES'
		},
		{
			title: 'CNN',
			image: 'https://via.placeholder.com/300x400/CC0000/FFFFFF?text=CNN'
		},
		{
			title: 'TRUFFLE',
			image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=TRUFFLE'
		},
		{
			title: 'STAX.AI',
			image: 'https://via.placeholder.com/300x400/4B0082/FFFFFF?text=STAX.AI'
		},
		{
			title: 'RESUME',
			image: 'https://via.placeholder.com/300x400/2C3E50/FFFFFF?text=RESUME'
		},
		{
			title: 'HOME',
			image: 'https://via.placeholder.com/300x400/27AE60/FFFFFF?text=HOME'
		}
	];
</script>

<div class="page">
	<div class="content">
		<h1>Card Stack Demo</h1>
		<p>Drag horizontally on desktop or swipe vertically on mobile</p>
		<div class="card-container">
			<CardStack cards={sampleCards} />
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 20px;
	}

	.content {
		text-align: center;
	}

	h1 {
		color: white;
		margin: 0 0 10px 0;
		font-size: 2.5rem;
	}

	p {
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 40px 0;
		font-size: 1.1rem;
	}

	.card-container {
		display: flex;
		justify-content: center;
		margin-top: 40px;
	}
</style>
