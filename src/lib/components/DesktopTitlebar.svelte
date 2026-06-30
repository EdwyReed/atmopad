<script lang="ts">
  import { onMount } from 'svelte';

  import { createDesktopWindowController, type DesktopWindowController } from '$lib/desktop/window';
  import AtmoIcon from './AtmoIcon.svelte';

  let controller: DesktopWindowController | null = null;
  let visible = false;

  onMount(() => {
    controller = createDesktopWindowController();
    visible = controller.isDesktop;

    if (visible) {
      document.body.classList.add('atmopad-desktop');
    }

    return () => {
      document.body.classList.remove('atmopad-desktop');
    };
  });

  async function minimize() {
    await controller?.minimize();
  }

  async function toggleMaximize() {
    await controller?.toggleMaximize();
  }

  async function closeWindow() {
    await controller?.close();
  }
</script>

{#if visible}
  <header class="desktop-titlebar" aria-label="Atmopad window controls">
    <div class="titlebar-drag-region" data-tauri-drag-region>
      <span class="titlebar-mark">
        <AtmoIcon name="bloom" />
      </span>
      <span class="titlebar-name">Atmopad</span>
    </div>

    <div class="titlebar-controls">
      <button type="button" aria-label="Minimize window" on:click={minimize}>
        <AtmoIcon name="window-minimize" />
      </button>
      <button type="button" aria-label="Maximize window" on:click={toggleMaximize}>
        <AtmoIcon name="window-maximize" />
      </button>
      <button type="button" aria-label="Close window" class="close" on:click={closeWindow}>
        <AtmoIcon name="window-close" />
      </button>
    </div>
  </header>
{/if}

<style>
  .desktop-titlebar {
    --titlebar-text: color-mix(in srgb, var(--text, #617068) 82%, white 8%);
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 20;
    height: 2.65rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 0.34rem 0.45rem 0.34rem 0.72rem;
    color: var(--titlebar-text);
    background:
      linear-gradient(90deg, rgba(226, 239, 222, 0.11), rgba(255, 255, 255, 0.035) 55%, rgba(244, 221, 204, 0.1)),
      rgba(255, 255, 255, 0.035);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px) saturate(1.08);
    user-select: none;
  }

  :global(body:has(.app-shell[data-theme='moonlit'])) .desktop-titlebar {
    background:
      linear-gradient(90deg, rgba(49, 102, 112, 0.09), rgba(255, 255, 255, 0.02) 55%, rgba(155, 86, 49, 0.08)),
      rgba(5, 8, 12, 0.12);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .titlebar-drag-region {
    height: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.48rem;
  }

  .titlebar-mark {
    width: 1.58rem;
    height: 1.58rem;
    display: grid;
    place-items: center;
    color: color-mix(in srgb, var(--icon-strong, #526358) 82%, white 10%);
    opacity: 0.82;
  }

  .titlebar-mark :global(.atmo-icon) {
    width: 1.18rem;
    height: 1.18rem;
  }

  .titlebar-name {
    overflow: hidden;
    color: color-mix(in srgb, var(--titlebar-text) 84%, transparent);
    font: 650 0.75rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .titlebar-controls {
    display: flex;
    align-items: center;
    gap: 0.22rem;
  }

  .titlebar-controls button {
    width: 2rem;
    height: 1.78rem;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 0.68rem;
    color: color-mix(in srgb, var(--icon, #526358) 80%, white 8%);
    background: transparent;
    cursor: pointer;
    transition:
      color 160ms ease,
      background 160ms ease,
      transform 160ms ease;
  }

  .titlebar-controls button:hover,
  .titlebar-controls button:focus-visible {
    color: var(--icon-strong, #37483e);
    background: color-mix(in srgb, var(--surface-glass, rgba(255, 255, 255, 0.16)) 52%, rgba(255, 255, 255, 0.22));
    outline: none;
  }

  .titlebar-controls button:active {
    transform: translateY(1px);
  }

  .titlebar-controls button.close:hover,
  .titlebar-controls button.close:focus-visible {
    color: #fff7f2;
    background: rgba(207, 91, 68, 0.62);
  }

  .titlebar-controls :global(.atmo-icon) {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (max-width: 760px) {
    .desktop-titlebar {
      height: 2.45rem;
    }

    .titlebar-name {
      display: none;
    }
  }
</style>
