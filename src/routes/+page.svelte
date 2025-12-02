<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { ClipboardIcon, RefreshCcwIcon } from '@lucide/svelte';
	import { watch } from 'runed';
	import { Message, MessageContent } from '$lib/components/ai-elements/message/index.js';
	import { Action, Actions } from '$lib/components/ai-elements/action/index.js';
	import {
		Conversation,
		ConversationContent,
		ConversationEmptyState,
		ConversationScrollButton
	} from '$lib/components/ai-elements/conversation/index.js';
	import { Response } from '$lib/components/ai-elements/response/index.js';
	import {
		PromptInput,
		PromptInputBody,
		PromptInputSubmit,
		PromptInputTextarea,
		PromptInputToolbar,
		type ChatStatus,
		type PromptInputMessage
	} from '$lib/components/ai-elements/prompt-input/index.js';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let userId = $state<string>('');

	let input_prompt = $state('');
	let chat = $derived(new Chat({ messages: data.conversation }));
	let status = $state<ChatStatus>('idle');

	// Pre-surgery preparation messages
	let preSurgeryMessages = [
		{
			text: "Hello! I'm here to help you prepare for your surgery. I can provide guidance on:\n\n• **Pre-operative instructions** (fasting, medications, skin preparation)\n• **Dietary guidelines** (what to eat and avoid before surgery)\n• **Recovery expectations** (timeline, activity restrictions)\n• **Medication management** (timing, interactions)\n• **Post-operative care** (wound care, follow-up appointments)\n\nTo get started, please tell me:\n• What type of surgery are you having?\n• Your surgery date?\n• Any specific concerns or questions?\n\nI'll provide personalized advice based on your situation!",
			type: 'pre-surgery-info'
		}
	];

	let sendPreSurgeryMessage = (message: string) => {
		if (status === 'idle') {
			chat.sendMessage({ text: message });
		}
	};

	let handleSubmit = (message: PromptInputMessage, event: SubmitEvent) => {
		event.preventDefault();
		const textContent = message.text || '';
		if (textContent.trim() !== '' && status === 'idle') {
			chat.sendMessage({ text: textContent });
		}

		// Clear the input field after submission
		input_prompt = '';
	};

	let retryMessage = () => {
		chat.regenerate();
	};

	let copyMessage = (message: string) => {
		navigator.clipboard.writeText(message);
	};

	let startNewConversation = () => {
		// Create a new Chat instance to clear all messages
		chat = new Chat({});
	};

	// Watch for changes in chat status
	watch(
		() => chat.status,
		() => {
			if (chat.status === 'error') {
				status = 'error';
			} else if (chat.status === 'streaming') {
				status = 'streaming';
			} else if (chat.status === 'ready') {
				status = 'idle';
			} else if (chat.status === 'submitted') {
				status = 'submitted';
			}
		}
	);

	onMount(async () => {
		const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
		const fpPromise = FingerprintJS.load();
		const fp = await fpPromise;
		const result = await fp.get();
		userId = result.visitorId;
		document.cookie = `userId=${userId}; path=/; max-age=31536000; SameSite=Lax`;
	});
</script>

<!--
    Structure:
    - Header : Title, New Chat Button, Dark/Light Mode Toggle
    - Chat Messages Container
    - Input Container
   -->

<main class="flex flex-col h-screen bg-background">
	<!-- Header -->
	<header class="bg-background border-b border-border px-6 h-16 shadow-sm">
		<div class="max-w-4xl mx-auto flex items-center justify-between h-full">
			<div>
				<h1 class="text-xl font-semibold text-foreground">Pre-Surgery Consultant AI</h1>
				<p class="text-xs text-muted-foreground">
					Get personalized advice for your pre-surgery consultation.
				</p>
			</div>
			<button
				class="bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-lg text-sm transition-colors"
				onclick={startNewConversation}
				title="Start new conversation"
			>
				New Chat
			</button>
		</div>
	</header>

	<!-- Chat Messages Container -->
	<Conversation class="flex-1">
		<ConversationContent class="max-w-3xl mx-auto w-full px-4">
			{#if chat.messages.length === 0}
				<ConversationEmptyState
					title="Welcome! Get personalized advice for your pre-surgery consultation."
					description="Start a conversation by typing a message below, or choose a pre-surgery topic:"
				>
					{#snippet icon()}
						<div class="text-3xl">👋</div>
					{/snippet}

					<!-- Pre-surgery Quick Actions -->
					<div class="flex flex-wrap gap-2 mt-4">
						{#each preSurgeryMessages as msg (msg)}
							<button
								class="bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-2 rounded-lg text-sm transition-colors"
								onclick={() => sendPreSurgeryMessage(msg.text)}
							>
								{msg.text}
							</button>
						{/each}
					</div>
				</ConversationEmptyState>
			{:else}
				<div class="space-y-4 py-4">
					{#each chat.messages as message, messageIndex (messageIndex)}
						<div class="group relative">
							<Message from={message.role}>
								<MessageContent>
									{#each message.parts as part, partIndex (partIndex)}
										{#if part.type === 'text'}
											{#if message.role === 'assistant'}
												<!-- Assistant Response with Streaming -->
												<Response content={part.text} animation={{ enabled: true }} />
											{:else}
												<!-- User Message -->
												<div class="prose prose-sm max-w-none dark:prose-invert">
													{part.text}
												</div>
											{/if}
										{/if}
									{/each}
								</MessageContent>
							</Message>

							<!-- Retry and Copy Actions for Assistant Messages -->
							{#if message.role === 'assistant'}
								<Actions class="opacity-0 group-hover:opacity-100 transition-opacity">
									<Action label="Retry" tooltip="Retry" onclick={retryMessage}>
										<RefreshCcwIcon class="size-4" />
									</Action>
									<Action
										label="Copy"
										tooltip="Copy"
										onclick={() => {
											copyMessage(
												message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('')
											);
										}}
									>
										<ClipboardIcon class="size-4" />
									</Action>
								</Actions>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</ConversationContent>
		<ConversationScrollButton />
	</Conversation>

	<!-- Input Container -->
	<div class="bg-background px-6 py-4">
		<div class="max-w-3xl mx-auto flex justify-center">
			<div class="w-full max-w-2xl">
				<PromptInput onSubmit={handleSubmit}>
					<PromptInputBody>
						<PromptInputTextarea bind:value={input_prompt} />
					</PromptInputBody>
					<PromptInputToolbar class="flex justify-end">
						<PromptInputSubmit {status} />
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	</div>
</main>

<style>
	:global(body) {
		scrollbar-width: thin;
		scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
	}

	:global(::-webkit-scrollbar) {
		width: 6px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background-color: rgba(155, 155, 155, 0.5);
		border-radius: 3px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background-color: rgba(155, 155, 155, 0.7);
	}
</style>
