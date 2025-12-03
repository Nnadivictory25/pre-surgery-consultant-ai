<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { ClipboardIcon, RefreshCcwIcon, PlusIcon, UserIcon, LogOutIcon } from '@lucide/svelte';
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
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';

	let { data }: { data: PageData } = $props();

	let userId = $state<string>('');
	let loggedIn = $state(false);
	let loading = $state(true);
	let email = $state(data.email || '');
	let name = $state(data.name || '');

	let input_prompt = $state('');
	let chat = $derived(new Chat({ messages: data.conversation }));
	let status = $state<ChatStatus>('idle');

	let handleSubmit = (message: PromptInputMessage, event: SubmitEvent) => {
		event.preventDefault();
		const textContent = message.text || '';
		if (textContent.trim() !== '' && status === 'idle') {
			chat.sendMessage({ text: textContent });
		}
		input_prompt = '';
	};

	let retryMessage = () => {
		chat.regenerate();
	};

	let copyMessage = (message: string) => {
		navigator.clipboard.writeText(message);
	};

	function startNewConversation() {
		// Reset chat to a fresh instance, effectively starting a new chat
		chat = new Chat({});
		input_prompt = '';
	}

	function logout() {
		document.cookie = 'userId=; path=/; max-age=0';
		document.cookie = 'email=; path=/; max-age=0';
		document.cookie = 'name=; path=/; max-age=0';
		goto('/login');
	}

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

		// Email and name are now loaded from server via data props

		const response = await fetch('/api/auth/check', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
		});
		const { loggedIn: isLoggedIn } = await response.json();
		if (isLoggedIn) {
			loggedIn = true;
		} else {
			goto('/login');
		}
		loading = false;
	});
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-screen bg-background">Loading...</div>
{:else if loggedIn}
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
				<!-- Buttons -->
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={startNewConversation}
						class="flex items-center gap-1"
					>
						<PlusIcon class="size-4" />
						New
					</Button>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" class="flex items-center gap-1">
								<UserIcon class="size-4" />
								Profile
							</Button>
						</PopoverTrigger>
						<PopoverContent class="w-80">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">User Profile</h4>
								<p class="text-sm text-foreground">
									<strong>Email:</strong>
									{email}
								</p>
								<p class="text-sm text-foreground">
									<strong>Name:</strong>
									{name}
								</p>
								<Button
									variant="destructive"
									size="sm"
									onclick={logout}
									class="w-full flex items-center gap-1"
								>
									<LogOutIcon class="size-4" />
									Logout
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</header>

		<!-- Chat Messages Container -->
		<Conversation class="flex-1">
			<ConversationContent class="max-w-3xl mx-auto w-full px-4">
				{#if chat.messages.length === 0}
					<ConversationEmptyState
						title="Welcome to Pre-Surgery Consultant AI by Chinatu Emmanuel! Get personalized advice for your pre-surgery consultation."
						description="Start a conversation by typing a message below or choose a suggested question."
					>
						{#snippet icon()}
							<div class="text-3xl">👋</div>
						{/snippet}
						{#snippet actions()}
							<div class="mt-6 max-w-md mx-auto">
								<p class="text-sm text-muted-foreground mb-4 text-center">
									Not sure what to ask? Try these suggestions:
								</p>
								<div class="space-y-3">
									{#each suggestions as suggestion}
										<Button
											variant="outline"
											size="default"
											onclick={() => {
												input_prompt = suggestion.text;
												chat.sendMessage({ text: suggestion.text });
											}}
											class="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal"
										>
											{suggestion.text}
										</Button>
									{/each}
								</div>
							</div>
						{/snippet}
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
{/if}

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
