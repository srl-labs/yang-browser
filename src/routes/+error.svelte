<script lang="ts">
	import { page } from '$app/stores'
</script>

<div class="flex h-screen p-7 font-nokia-headline-light">
	<div class="m-auto">
		<article class="rounded md:min-w-[400px]">
			<div class="text-white bg-red-500 px-5 py-3 rounded-t flex items-center">
        <a href="../" class="flex mr-4"><img src="/images/navbar-logo.png" alt="Logo" width="25"/></a>
				<div>
          <p class="text-xs">SR Linux YANG Models</p>
          <p>Error {$page.status}</p>
        </div>
			</div>
			<div class="bg-red-50 p-5 rounded-b text-red-500">
				{#if $page.error}
					<p>{$page.error.message}</p>
				{:else}
					<p>Unknown Error</p>
				{/if}
			</div>
		</article>
	</div>
</div>