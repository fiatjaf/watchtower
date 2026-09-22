<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit';
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let {
		type = 'button',
		variant = 'secondary',
		disabled = false,
		onclick,
		children
	}: Props = $props();

	const styles = {
		primary: 'bg-neutral-100 text-neutral-950 hover:bg-white',
		secondary: 'border border-neutral-700 text-neutral-300 hover:bg-neutral-900',
		danger: 'border border-red-900 text-red-200 hover:bg-red-950/60'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="rounded-md px-3 py-1.5 text-sm whitespace-nowrap disabled:opacity-50 {styles[variant]}"
>
	{@render children()}
</button>
