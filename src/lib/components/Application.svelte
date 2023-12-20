<script lang="ts">
  import { appFocus } from './sharedStore';
  let app = "";
	appFocus.subscribe((value) => {
    app = value;
  });

  const btnClass = "flex mx-0.5 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-400 hover:text-white transition duration-500";
  const appChange = (event: { currentTarget: { value: string; }; }) => appFocus.set(event.currentTarget.value);
</script>

<div class="mb-6 overflow-x-auto">
  <div class="flex w-fit items-center py-1.5 px-1 text-sm text-center bg-gray-200 dark:bg-gray-500 dark:text-gray-200 rounded-full">
    <button class="{btnClass} {app === '' ? 'bg-gray-400 text-white' : ''}" value="" on:click={appChange}>All</button>
    <button class="{btnClass} {app === 'logical-inventory' ? 'bg-gray-400 text-white' : ''}" value="logical-inventory" on:click={appChange}>Inventory</button>
    <button class="{btnClass} {app === 'service-fulfillment' ? 'bg-gray-400 text-white' : ''}" value="service-fulfillment" on:click={appChange}>SF</button>
    <button class="{btnClass} {app === 'icm' ? 'bg-gray-400 text-white' : ''}" value="icm" on:click={appChange}>ICM</button>
    <button class="{btnClass} {app === 'telemetry' ? 'bg-gray-400 text-white' : ''}" value="telemetry" on:click={appChange}>Telemetry</button>
  </div>
</div>