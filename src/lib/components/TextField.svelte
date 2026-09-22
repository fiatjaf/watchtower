<script lang="ts">
	interface Props {
		label: string;
		value: string;
		placeholder?: string;
		type?: 'text' | 'number';
		mono?: boolean;
		hint?: string;
	}

	let {
		label,
		value = $bindable(),
		placeholder = '',
		type = 'text',
		mono = false,
		hint
	}: Props = $props();

	const id = $props.id();
</script>

<div>
	<label class="block text-xs font-medium text-neutral-300" for={id}>{label}</label>
	<input
		{id}
		{type}
		{placeholder}
		bind:value
		autocomplete="off"
		autocapitalize="none"
		spellcheck="false"
		class="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-500 {mono
			? 'font-mono'
			: ''}"
	/>
	{#if hint}
		<p class="mt-1 text-xs text-neutral-500">{hint}</p>
	{/if}
</div>
