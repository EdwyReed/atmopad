<script lang="ts" context="module">
  export type AtmoIconName =
    | 'bloom'
    | 'new-pad'
    | 'export-text'
    | 'export-html'
    | 'split'
    | 'fullscreen'
    | 'print'
    | 'sound-on'
    | 'sound-off'
    | 'sun'
    | 'moon'
    | 'leaf'
    | 'window-minimize'
    | 'window-maximize'
    | 'window-close';
</script>

<script lang="ts">
  export let name: AtmoIconName;
</script>

<svg class="atmo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  {#if name === 'bloom'}
    <path d="M12 6.5c2.6 2.1 4.7 4 4.7 6.2 0 2.5-2 4.3-4.7 4.3s-4.7-1.8-4.7-4.3c0-2.2 2.1-4.1 4.7-6.2Z" />
    <path d="M8.1 10.4c-1.9-.2-3.2.5-4.1 1.8 1.5 1.1 3.3 1.4 5 .7M15.9 10.4c1.9-.2 3.2.5 4.1 1.8-1.5 1.1-3.3 1.4-5 .7" />
    <path d="M12 6.5V4M9.2 15.2h5.6" class="soft" />
  {:else if name === 'new-pad'}
    <path d="M7.2 4.2h7l2.6 2.7v12.9H7.2V4.2Z" />
    <path d="M14.2 4.4v3h3" />
    <path d="M9.6 12h4.8M12 9.6v4.8" class="soft" />
  {:else if name === 'export-text'}
    <path d="M5 6.4h14v11.2H5V6.4Z" />
    <path d="M8.4 10h7.2M8.4 12.8h5.7M8.4 15.5h3.6" class="soft" />
    <path d="M12 3.9v3.8M10.3 6.1 12 7.8l1.7-1.7" />
  {:else if name === 'export-html'}
    <path d="M5.2 4.6h13.6v14.8H5.2V4.6Z" />
    <path d="M9.2 10.2 7.7 12l1.5 1.8M14.8 10.2l1.5 1.8-1.5 1.8M12.9 9.6l-1.8 4.8" class="soft" />
  {:else if name === 'split'}
    <path d="M5.2 5.2h13.6v13.6H5.2V5.2Z" />
    <path d="M12 5.2v13.6" />
    <path d="M8.1 8.3h1.6M14.3 15.7h1.6" class="soft" />
  {:else if name === 'fullscreen'}
    <path d="M8.2 5.2H5.2v3M15.8 5.2h3v3M5.2 15.8v3h3M18.8 15.8v3h-3" />
    <path d="M9 9h6v6H9V9Z" class="soft" />
  {:else if name === 'print'}
    <path d="M7.2 8V4.6h9.6V8" />
    <path d="M6 16.2H4.8V9h14.4v7.2H18" />
    <path d="M7.2 13.7h9.6v5.7H7.2v-5.7Z" />
    <path d="M9.4 16.1h5.2" class="soft" />
  {:else if name === 'sound-on'}
    <path d="M5 13.8v-3.6h3L12 7v10l-4-3.2H5Z" />
    <path d="M15 9.6c1.1 1.3 1.1 3.5 0 4.8M17.4 7.7c2.2 2.6 2.2 6 0 8.6" class="soft" />
  {:else if name === 'sound-off'}
    <path d="M5 13.8v-3.6h3L12 7v10l-4-3.2H5Z" />
    <path d="m15.2 10.2 4 4M19.2 10.2l-4 4" class="soft" />
  {:else if name === 'sun'}
    <path d="M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z" />
    <path d="M12 4.2v1.7M12 18.1v1.7M4.2 12h1.7M18.1 12h1.7M6.5 6.5l1.2 1.2M16.3 16.3l1.2 1.2M17.5 6.5l-1.2 1.2M7.7 16.3l-1.2 1.2" class="soft" />
  {:else if name === 'moon'}
    <path d="M17.7 15.2A6.3 6.3 0 0 1 8.8 6.3 6.9 6.9 0 1 0 17.7 15.2Z" />
    <path d="M15.2 7.2h.1M18 10h.1" class="dot" />
  {:else if name === 'leaf'}
    <path d="M18.7 5.3C11 5.7 6.2 10.4 5.8 18.7c8.3-.4 13-5.2 12.9-13.4Z" />
    <path d="M6.3 18.2 14.3 10.2M9.7 14.8h4.2M12.1 12.4v4.5" class="soft" />
  {:else if name === 'window-minimize'}
    <path d="M7.2 14.2h9.6" />
    <path d="M9.3 12.4h5.4" class="soft" />
  {:else if name === 'window-maximize'}
    <path d="M7.6 7.4h8.8v8.8H7.6V7.4Z" />
    <path d="M10 7.4c.7 1.4 2 2.7 4.4 3.1M7.6 10.3c1.4 2.1 3.4 4.1 6.1 5.9" class="soft" />
  {:else if name === 'window-close'}
    <path d="m8.2 8.2 7.6 7.6M15.8 8.2l-7.6 7.6" />
    <path d="M12 7.2c2.1 0 4.8 2.7 4.8 4.8s-2.7 4.8-4.8 4.8-4.8-2.7-4.8-4.8 2.7-4.8 4.8-4.8Z" class="soft" />
  {/if}
</svg>

<style>
  .atmo-icon {
    width: 1.54rem;
    height: 1.54rem;
    display: block;
    overflow: visible;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0.18rem 0.24rem color-mix(in srgb, currentColor 18%, transparent));
  }

  .soft {
    opacity: 0.7;
    stroke-width: 1.28;
  }

  .dot {
    stroke-width: 2.4;
  }
</style>
