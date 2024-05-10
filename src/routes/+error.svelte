<script lang="ts">
	import { page } from '$app/stores';

	const custom = {
		error: {
			body: "flex h-screen p-7 font-nokia-headline-light",
			container: "m-auto",
			message: "rounded min-w-[400px]",
			message_header: "text-white bg-red-400 px-5 py-3 rounded-t flex items-center justify-between",
			message_body: "bg-red-50 p-5 rounded-b text-red-500",
			back_home: "inline-flex items-center text-sm px-2 py-1 bg-red-600 hover:bg-red-700 rounded-lg"
		}
	}
</script>

<div class="{custom.error.body}">
	<div class="{custom.error.container}">
		<article class="{custom.error.message}">
			<div class="{custom.error.message_header}">
				<p>Error {$page.status}</p>
				<a href="../" class="{custom.error.back_home}">
					<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
						<path fill-rule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" clip-rule="evenodd"/>
					</svg>
					<span class="ml-0.5">Home</span>			
				</a>
			</div>
			<div class="{custom.error.message_body}">
				{#if $page.error}
					<p>{$page.error.message}</p>
				{:else}
					<p>Unknown Error</p>
				{/if}
			</div>
		</article>
	</div>
</div>