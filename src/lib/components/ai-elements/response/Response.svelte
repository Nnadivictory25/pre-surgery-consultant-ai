<script lang="ts">
	import { Streamdown, type StreamdownProps } from 'svelte-streamdown';
	import { cn } from '$lib/utils';

	type Props = StreamdownProps & {
		class?: string;
	};

	let { class: className, ...restProps }: Props = $props();
</script>

<Streamdown
	class={cn(
		'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose prose-slate dark:prose-invert max-w-none',
		className
	)}
	shikiTheme="github-light-default"
	baseTheme="shadcn"
	parseIncompleteMarkdown={true}
	{...restProps}
/>
