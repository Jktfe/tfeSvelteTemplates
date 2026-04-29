<!--
  ============================================================
  CodeBlockTestHarness
  ============================================================

  Compile-only render contract for CodeBlock. svelte-check
  uses this file to confirm every prop combination type-checks
  and the component template stays valid as the API evolves.

  Behavioural assertions live in CodeBlock.test.ts and
  tokenize.test.ts via the pure-helper exports — no DOM
  coupling required.
  ============================================================
-->
<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';

	const tsSnippet = `interface User { name: string; age: number }
const ada: User = { name: 'Ada', age: 36 };
console.log(ada);`;

	const jsSnippet = `// Greet a name with a template string
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('world'));`;

	const svelteSnippet = `<script lang="ts">
  let count = 0;
<` + `/script>
<button on:click={() => count++}>{count}</button>`;

	const jsonSnippet = `{ "name": "Ada", "active": true, "score": 99.5 }`;

	const bashSnippet = `#!/bin/bash
for f in *.txt; do
  echo "$f"
done`;

	const diffSnippet = ` const greet = (name) => {
-  console.log('hi ' + name);
+  console.log(\`hi \${name}\`);
   return name;
 };`;
</script>

<!-- Default props -->
<CodeBlock code={tsSnippet} />

<!-- Every variant × every size -->
<CodeBlock code={tsSnippet} variant="plain" size="sm" />
<CodeBlock code={tsSnippet} variant="plain" size="md" />
<CodeBlock code={tsSnippet} variant="plain" size="lg" />

<CodeBlock code={tsSnippet} variant="lined" size="sm" />
<CodeBlock code={tsSnippet} variant="lined" size="md" />
<CodeBlock code={tsSnippet} variant="lined" size="lg" />

<CodeBlock code={tsSnippet} variant="titled" size="sm" title="Demo" />
<CodeBlock code={tsSnippet} variant="titled" size="md" title="Demo" />
<CodeBlock code={tsSnippet} variant="titled" size="lg" title="Demo" />

<CodeBlock code={diffSnippet} variant="diff" size="sm" />
<CodeBlock code={diffSnippet} variant="diff" size="md" />
<CodeBlock code={diffSnippet} variant="diff" size="lg" />

<CodeBlock code={bashSnippet} variant="terminal" size="sm" />
<CodeBlock code={bashSnippet} variant="terminal" size="md" />
<CodeBlock code={bashSnippet} variant="terminal" size="lg" />

<!-- Per-language smoke tests -->
<CodeBlock code={tsSnippet} language="ts" variant="lined" />
<CodeBlock code={jsSnippet} language="js" variant="lined" />
<CodeBlock code={svelteSnippet} language="svelte" variant="titled" fileName="Counter.svelte" />
<CodeBlock code={jsonSnippet} language="json" variant="plain" />
<CodeBlock code={bashSnippet} language="bash" variant="terminal" />
<CodeBlock code="just some text" language="plain" />

<!-- Highlight + wrap + light theme -->
<CodeBlock
	code={tsSnippet}
	variant="lined"
	highlight="1,3"
	theme="light"
	wrap
	aria-label="Example with highlight"
/>

<!-- Header forced via title without explicit variant -->
<CodeBlock code={jsSnippet} title="Standalone header" />

<!-- Copy disabled -->
<CodeBlock code={tsSnippet} variant="titled" title="No copy" copyable={false} />
