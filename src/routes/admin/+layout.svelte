<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { session } from '$lib/session.svelte.js';

	let { children } = $props();

	const links = [
		{ href: resolve('/admin'), label: 'Overview' },
		{ href: resolve('/admin/pubkeys'), label: 'Pubkeys' },
		{ href: resolve('/admin/events'), label: 'Events' },
		{ href: resolve('/admin/moderation'), label: 'Moderation' },
		{ href: resolve('/admin/ips'), label: 'IPs' },
		{ href: resolve('/admin/kinds'), label: 'Kinds' },
		{ href: resolve('/admin/relay'), label: 'Relay' },
		{ href: resolve('/admin/roles'), label: 'Roles' }
	];

	$effect(() => {
		if (!session.isAuthenticated) {
			void goto(resolve('/'));
		}
	});

	function signOut() {
		session.signOut();
		void goto(resolve('/'));
	}
</script>

{#if session.isAuthenticated}
	<div class="min-h-screen bg-neutral-950 text-neutral-100">
		<header class="border-b border-neutral-800">
			<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
				<div class="min-w-0">
					<p class="text-sm font-semibold">Tower</p>
					<p class="truncate font-mono text-xs text-neutral-400">{session.relayUrl}</p>
				</div>
				<div class="flex items-center gap-3">
					<span class="hidden max-w-64 truncate font-mono text-xs text-neutral-500 sm:block">
						{session.npub}
					</span>
					<button
						type="button"
						onclick={signOut}
						class="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900"
					>
						Sign out
					</button>
				</div>
			</div>
		</header>

		<nav class="border-b border-neutral-800">
			<div class="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap {page.url.pathname ===
						link.href
							? 'border-neutral-200 text-neutral-100'
							: 'border-transparent text-neutral-400 hover:text-neutral-200'}"
					>
						{link.label}
					</a>
				{/each}
			</div>
		</nav>

		<main class="mx-auto max-w-3xl px-4 py-6">
			{@render children()}
		</main>
	</div>
{/if}
