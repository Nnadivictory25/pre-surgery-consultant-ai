<script lang="ts">
	import { PromptInputController, setPromptInputProvider } from './attachments-context.svelte.js';

	interface Props {
		initialInput?: string;
		accept?: string;
		multiple?: boolean;
		children?: import('svelte').Snippet;
	}

	let { initialInput = '', accept, multiple = true, children }: Props = $props();

	let controller = $derived(new PromptInputController(initialInput, accept, multiple));

	$effect(() => {
		setPromptInputProvider(controller);
	});
</script>

{#if children}
	{@render children()}
{/if}
