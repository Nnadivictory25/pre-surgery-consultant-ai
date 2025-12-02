import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		minify: 'esbuild',
		target: 'esnext'
	},
	optimizeDeps: {
		include: ['@ai-sdk/svelte', 'ai']
	}
});
