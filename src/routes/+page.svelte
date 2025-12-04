<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';
	import {
		ClipboardIcon,
		RefreshCcwIcon,
		PlusIcon,
		UserIcon,
		LogOutIcon,
		ThumbsUpIcon,
		ThumbsDownIcon
	} from '@lucide/svelte';
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
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import SidebarSheet from '$lib/components/SidebarSheet.svelte';

	let { data }: { data: PageData } = $props();

	let userId = $state<string>('');
	let loggedIn = $state(false);
	let loading = $state(true);
	let email = $derived(data.email || '');
	let name = $derived(data.name || '');
	let sidebarOpen = $state(false);
	let sessionId = $state<string>('');
	let messageRatings = $state<Record<number, 1 | -1>>({}); // messageIndex -> rating

	const suggestions = [
		{ text: 'What should I eat the day before my surgery?' },
		{ text: 'What medications should I avoid before surgery?' },
		{ text: 'How should I prepare my home for post-surgery recovery?' },
		{ text: 'What questions should I ask my surgeon before the procedure?' }
	];

	let input_prompt = $state('');
	let chat = $derived(
		new Chat({
			messages: data.conversation,
			transport: new DefaultChatTransport({
				api: '/api/chat',
				body: { sessionId }
			})
		})
	);
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

	async function rateMessage(messageIndex: number, messageContent: string, rating: 1 | -1) {
		if (!sessionId) return;

		try {
			await fetch('/api/feedback/rate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId, messageIndex, messageContent, rating })
			});
			messageRatings[messageIndex] = rating;
		} catch (error) {
			console.error('Failed to submit rating:', error);
		}
	}

	function startNewConversation() {
		// Reset chat to a fresh instance, effectively starting a new chat
		chat = new Chat({});
		input_prompt = '';
		messageRatings = {};
	}

	async function logout() {
		// End session before logout
		if (sessionId) {
			try {
				await fetch('/api/session/end', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sessionId })
				});
			} catch (error) {
				console.error('Failed to end session:', error);
			}
		}

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

			// Start a new session
			try {
				const sessionResponse = await fetch('/api/session/start', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				});
				const sessionData = await sessionResponse.json();
				sessionId = sessionData.sessionId;
			} catch (error) {
				console.error('Failed to start session:', error);
			}
		} else {
			goto('/login');
		}
		loading = false;
	});

	onDestroy(async () => {
		// End session when component is destroyed
		if (sessionId) {
			try {
				await fetch('/api/session/end', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sessionId })
				});
			} catch (error) {
				console.error('Failed to end session:', error);
			}
		}
	});
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-screen bg-background">Loading...</div>
{:else if loggedIn}
	<main class="flex flex-col h-screen bg-background">
		<!-- Header -->
		<header class="bg-background border-b border-border px-4 sm:px-6 h-16 shadow-sm">
			<div class="max-w-4xl mx-auto flex items-center justify-between h-full">
				<!-- Title and Description -->
				<div class="flex flex-col items-center sm:items-start text-center sm:text-left">
					<h1 class="text-lg sm:text-xl font-semibold text-foreground">
						Pre-Surgery Consultant AI
					</h1>
					<p class="text-xs text-muted-foreground hidden sm:block">
						Get personalized advice for your pre-surgery consultation.
					</p>
				</div>
				<!-- Desktop Buttons -->
				<div class="hidden sm:flex items-center gap-2">
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
				<!-- Mobile Menu Button -->
				<div class="sm:hidden">
					<Button
						variant="outline"
						size="sm"
						onclick={() => (sidebarOpen = true)}
						class="flex items-center gap-1"
					>
						<UserIcon class="size-4" />
						Menu
					</Button>
				</div>
			</div>
		</header>

		<!-- Mobile Sidebar -->
		<SidebarSheet
			open={sidebarOpen}
			onOpenChange={(open) => (sidebarOpen = open)}
			{email}
			{name}
			onNewConversation={startNewConversation}
			onLogout={logout}
		/>

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
									{#each suggestions as suggestion, index (index)}
										<Button
											variant="outline"
											size="default"
											onclick={() => {
												chat.sendMessage({ text: suggestion.text });
												input_prompt = '';
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
										<!-- Thumbs Up/Down Rating -->
										<Action
											label="Thumbs Up"
											tooltip="Good response"
											onclick={() => {
												const messageText = message.parts
													.map((p) => (p.type === 'text' ? p.text : ''))
													.join('');
												rateMessage(messageIndex, messageText, 1);
											}}
											class={messageRatings[messageIndex] === 1
												? 'text-green-600 dark:text-green-400'
												: ''}
										>
											<ThumbsUpIcon class="size-4" />
										</Action>
										<Action
											label="Thumbs Down"
											tooltip="Poor response"
											onclick={() => {
												const messageText = message.parts
													.map((p) => (p.type === 'text' ? p.text : ''))
													.join('');
												rateMessage(messageIndex, messageText, -1);
											}}
											class={messageRatings[messageIndex] === -1
												? 'text-red-600 dark:text-red-400'
												: ''}
										>
											<ThumbsDownIcon class="size-4" />
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
