<script lang="ts">
  import AnimatedText from '$lib/components/AnimatedText.svelte';
</script>

<svelte:head>
  <title>AnimatedText Demo – TFE</title>
  <meta name="description" content="Demo of AnimatedText component – text follows a path and morphs on hover."/>
</svelte:head>

<div class="demo-page">
  <h1>Animated Text Demo</h1>
  <p>Hover over the card to see the text morph.</p>
  <AnimatedText
    originalText="STATIC DRIFT TRANSMIT RECEIVE"
    morphedText="ANOTHER TEXT TO MORPH INTO"
  />
</div>

<style>
.demo-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
