<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'info' | 'success' | 'error';
		children: Snippet;
	}

	let { tone = 'info', children }: Props = $props();

	const styles = {
		info: 'border-neutral-800 bg-neutral-900 text-neutral-300',
		success: 'border-emerald-900 bg-emerald-950/60 text-emerald-200',
		error: 'border-red-900 bg-red-950/60 text-red-200'
	};
</script>

<p
	class="rounded-md border px-3 py-2 text-sm {styles[tone]}"
	role={tone === 'error' ? 'alert' : undefined}
>
	{@render children()}
</p>
