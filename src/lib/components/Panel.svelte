<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		action?: Snippet;
		children: Snippet;
	}

	let { title, description, action, children }: Props = $props();
</script>

<section class="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<h2 class="text-sm font-semibold">{title}</h2>
			{#if description}
				<p class="mt-0.5 font-mono text-xs break-all text-neutral-500">{description}</p>
			{/if}
		</div>
		{#if action}
			{@render action()}
		{/if}
	</div>
	<div class="mt-4 space-y-4">
		{@render children()}
	</div>
</section>
