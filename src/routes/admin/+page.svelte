<script lang="ts">
	import { onMount } from 'svelte';
	import { admin } from '$lib/admin.svelte.js';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { session } from '$lib/session.svelte.js';

	onMount(() => {
		void admin.load();
	});
</script>

<Panel title="Relay management API" description={session.relayUrl}>
	{#snippet action()}
		<Button onclick={() => void admin.load(true)} disabled={admin.loading}>Refresh</Button>
	{/snippet}

	{#if admin.loading && admin.methods.length === 0}
		<p class="text-sm text-neutral-400">Asking the relay which methods it supports...</p>
	{:else if admin.error}
		<Notice tone="error">{admin.error}</Notice>
	{:else}
		<p class="text-sm text-neutral-400">
			The relay accepts signed requests from this key and supports {admin.methods.length} management methods.
		</p>
		<ul class="flex flex-wrap gap-2">
			{#each admin.methods as method (method)}
				<li
					class="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 font-mono text-xs text-neutral-300"
				>
					{method}
				</li>
			{/each}
		</ul>
	{/if}
</Panel>
