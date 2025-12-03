<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let userId = '';
	let submitting = $state(false);

	onMount(async () => {
		const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
		const fpPromise = FingerprintJS.load();
		const fp = await fpPromise;
		const result = await fp.get();
		userId = result.visitorId;
		document.cookie = `userId=${userId}; path=/; max-age=31536000; SameSite=Lax`;
	});
</script>

<main class="flex items-center justify-center min-h-screen bg-background">
	<div class="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
		<h1 class="text-2xl font-bold text-center mb-6">Login</h1>
		<form method="POST" on:submit={() => (submitting = true)} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium">Email</label>
				<input
					autocomplete="email"
					type="email"
					id="email"
					name="email"
					required
					class="w-full p-2 border rounded"
				/>
			</div>
			<div>
				<label for="name" class="block text-sm font-medium">Name</label>
				<input
					autocomplete="name"
					type="text"
					id="name"
					name="name"
					required
					class="w-full p-2 border rounded"
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="w-full p-2 border rounded"
				/>
			</div>
			<Button type="submit" disabled={submitting} class="w-full">
				{submitting ? 'Logging in...' : 'Login'}
			</Button>
		</form>
	</div>
</main>
