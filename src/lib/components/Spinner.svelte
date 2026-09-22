<script lang="ts">
	import { iconPaths } from './icons';

	interface Props {
		/** Space for screen readers; the spinner is decorative by default. */
		label?: string;
	}

	let { label }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	width="16"
	height="16"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="animate-spin motion-reduce:animate-none"
	role={label ? 'status' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path d={iconPaths.refresh} />
</svg>
