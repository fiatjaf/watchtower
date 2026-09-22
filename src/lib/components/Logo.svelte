<script lang="ts">
	interface Props {
		size?: 'sm' | 'md';
	}

	let { size = 'md' }: Props = $props();
	const box = $derived(size === 'sm' ? 'size-6' : 'size-7');
</script>

<img src="/icon-64.png" alt="" class="{box} shrink-0 object-contain" />
