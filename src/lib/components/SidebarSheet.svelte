<script lang="ts">
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { PlusIcon, UserIcon, LogOutIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let {
		open,
		onOpenChange,
		email,
		name,
		onNewConversation,
		onLogout
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		email: string;
		name: string;
		onNewConversation: () => void;
		onLogout: () => void;
	} = $props();
</script>

<Sheet {open} {onOpenChange}>
	<SheetContent class="w-80 h-full sm:h-auto">
		<SheetHeader>
			<SheetTitle>Menu</SheetTitle>
		</SheetHeader>
		<div class="flex flex-col space-y-4 p-4">
			<!-- User Info -->
			<div class="space-y-2 pb-4 border-b">
				<h3 class="font-medium text-sm text-muted-foreground">User Profile</h3>
				<p class="text-sm">
					<strong>Email:</strong>
					{email}
				</p>
				<p class="text-sm">
					<strong>Name:</strong>
					{name}
				</p>
			</div>

			<!-- Actions -->
			<div class="space-y-2">
				<Button
					variant="default"
					size="sm"
					onclick={onNewConversation}
					class="w-full flex items-center gap-2 justify-start"
				>
					<PlusIcon class="size-4" />
					New Conversation
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={onLogout}
					class="w-full flex items-center gap-2 justify-start"
				>
					<LogOutIcon class="size-4" />
					Logout
				</Button>
			</div>
		</div>
	</SheetContent>
</Sheet>
