<script lang="ts">
	import Button from './Button.svelte';

	export interface ValueListItem {
		/** Raw value used by the action, such as a hex pubkey. */
		value: string;
		/** Main line of the row, such as an npub or a kind number. */
		label: string;
		/** Secondary line, for example the hex form of a pubkey. */
		sublabel?: string;
		reason?: string;
	}

	interface Props {
		items: ValueListItem[];
		empty: string;
		actionLabel?: string;
		/** False hides the action button, for example when the relay lacks the method. */
		showAction?: boolean;
		busyValue?: string | null;
		onAction?: (item: ValueListItem) => void;
	}

	let {
		items,
		empty,
		actionLabel = '',
		showAction = true,
		busyValue = null,
		onAction
	}: Props = $props();
</script>

{#if items.length === 0}
	<p class="text-sm text-neutral-500">{empty}</p>
{:else}
	<ul class="divide-y divide-neutral-800 overflow-hidden rounded-md border border-neutral-800">
		{#each items as item (item.value)}
			<li class="flex items-center justify-between gap-3 px-3 py-2">
				<div class="min-w-0">
					<p class="truncate font-mono text-xs text-neutral-200">{item.label}</p>
					{#if item.sublabel}
						<p class="truncate font-mono text-[11px] text-neutral-500">{item.sublabel}</p>
					{/if}
					{#if item.reason}
						<p class="truncate text-xs text-neutral-400">reason: {item.reason}</p>
					{/if}
				</div>
				{#if showAction && actionLabel && onAction}
					<Button
						variant="danger"
						disabled={busyValue === item.value}
						onclick={() => onAction?.(item)}
					>
						{busyValue === item.value ? 'Working...' : actionLabel}
					</Button>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
