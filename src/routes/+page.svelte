<script lang="ts">
  import { onMount } from 'svelte';

  import AtmoIcon from '$lib/components/AtmoIcon.svelte';
  import DesktopTitlebar from '$lib/components/DesktopTitlebar.svelte';
  import IconButton from '$lib/components/IconButton.svelte';
  import PaneEditor from '$lib/editor/PaneEditor.svelte';
  import { classifyKeySound, TypingAudio } from '$lib/audio/audio';
  import { clearWorkspace, loadWorkspace, saveWorkspace } from '$lib/storage/storage';
  import { createWorkspaceSession } from '$lib/workspace/session';
  import {
    buildPaneExport,
    calculateTextMetrics,
    clampSplitRatio,
    createDefaultWorkspace,
    type PaneId,
    type ThemeId,
    type WorkspaceSnapshot
  } from '$lib/workspace/workspace';

  let workspace: WorkspaceSnapshot = createDefaultWorkspace();
  let session = createWorkspaceSession(workspace, { save: saveWorkspace });
  let audio: TypingAudio | null = null;
  let surfaceElement: HTMLDivElement;
  let dragging = false;
  let mobilePane: PaneId = 'left';

  $: leftMetrics = calculateTextMetrics(workspace.panes.left.plainText);
  $: rightMetrics = calculateTextMetrics(workspace.panes.right.plainText);
  $: activePane = workspace.activePane;

  onMount(async () => {
    audio = new TypingAudio();
    const saved = await loadWorkspace();
    if (saved) {
      workspace = saved;
      session = createWorkspaceSession(workspace, { save: saveWorkspace });
      mobilePane = workspace.activePane;
    }
  });

  function refreshWorkspace() {
    workspace = session.getSnapshot();
  }

  function updatePane(
    id: PaneId,
    update: { contentJson: unknown; plainText: string; html: string }
  ) {
    session.updatePane(id, update);
    refreshWorkspace();
  }

  function setActivePane(id: PaneId) {
    workspace = {
      ...workspace,
      activePane: id
    };
    mobilePane = id;
  }

  function setSplitRatio(ratio: number) {
    session.setSplitRatio(clampSplitRatio(ratio));
    refreshWorkspace();
  }

  async function resetWorkspace() {
    if (!window.confirm('Clear both pads and start a new Atmopad workspace?')) return;
    await clearWorkspace();
    workspace = createDefaultWorkspace();
    session = createWorkspaceSession(workspace, { save: saveWorkspace });
  }

  function exportPane(id: PaneId, format: 'txt' | 'html') {
    const paneExport = buildPaneExport(workspace.panes[id], format);
    const blob = new Blob([paneExport.content], { type: paneExport.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = paneExport.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  }

  function printWorkspace() {
    window.print();
  }

  function toggleSound() {
    workspace = {
      ...workspace,
      settings: {
        ...workspace.settings,
        soundEnabled: !workspace.settings.soundEnabled
      }
    };
    session.replace(workspace);
  }

  function setTheme(theme: ThemeId) {
    workspace = {
      ...workspace,
      settings: {
        ...workspace.settings,
        theme
      }
    };
    session.replace(workspace);
  }

  function toggleMultiPanels() {
    workspace = {
      ...workspace,
      settings: {
        ...workspace.settings,
        multiPanel: !workspace.settings.multiPanel
      }
    };
    session.replace(workspace);
  }

  async function playKeySound(key: string) {
    if (!workspace.settings.soundEnabled) return;
    const sound = classifyKeySound(key);
    if (!sound) return;
    await audio?.unlock();
    audio?.play(sound);
  }

  function beginDrag(event: PointerEvent) {
    dragging = true;
    event.preventDefault();
    window.addEventListener('pointermove', dragDivider);
    window.addEventListener('pointerup', endDrag, { once: true });
  }

  function dragDivider(event: PointerEvent) {
    if (!dragging || !surfaceElement) return;
    const rect = surfaceElement.getBoundingClientRect();
    const nextRatio = (event.clientX - rect.left) / rect.width;
    setSplitRatio(nextRatio);
  }

  function endDrag() {
    dragging = false;
    window.removeEventListener('pointermove', dragDivider);
  }
</script>

<svelte:head>
  <title>Atmopad</title>
</svelte:head>

<DesktopTitlebar />

<main
  class:dragging
  class:focus-mode={workspace.settings.focusMode}
  class:single-panel={!workspace.settings.multiPanel}
  class="app-shell"
  data-theme={workspace.settings.theme}
  aria-label="Atmopad writing space"
>
  <div class="ambient ambient-left"></div>
  <div class="ambient ambient-right"></div>

  <aside class="rail rail-left" aria-label="Workspace actions">
    <IconButton label="Atmopad home mark" active={true}>
      <AtmoIcon name="bloom" />
    </IconButton>

    <div class="rail-group">
      <IconButton label="New workspace" onClick={resetWorkspace}>
        <AtmoIcon name="new-pad" />
      </IconButton>
      <IconButton label="Export active pane as text" onClick={() => exportPane(activePane, 'txt')}>
        <AtmoIcon name="export-text" />
      </IconButton>
      <IconButton label="Export active pane as HTML" onClick={() => exportPane(activePane, 'html')}>
        <AtmoIcon name="export-html" />
      </IconButton>
    </div>

    <div class="rail-group">
      <IconButton label="Toggle multi-panels" active={workspace.settings.multiPanel} onClick={toggleMultiPanels}>
        <AtmoIcon name="split" />
      </IconButton>
      <IconButton label="Toggle full screen" onClick={toggleFullscreen}>
        <AtmoIcon name="fullscreen" />
      </IconButton>
      <IconButton label="Print workspace" onClick={printWorkspace}>
        <AtmoIcon name="print" />
      </IconButton>
      <IconButton label={workspace.settings.soundEnabled ? 'Turn typing sound off' : 'Turn typing sound on'} active={workspace.settings.soundEnabled} onClick={toggleSound}>
        <AtmoIcon name={workspace.settings.soundEnabled ? 'sound-on' : 'sound-off'} />
      </IconButton>
    </div>
  </aside>

  <section class="workspace-frame" aria-label="Split writing workspace">
    <div class="mobile-switch" aria-label="Pane switcher">
      <button class:active={mobilePane === 'left'} type="button" on:click={() => (mobilePane = 'left')}>Left</button>
      <button class:active={mobilePane === 'right'} type="button" on:click={() => (mobilePane = 'right')}>Right</button>
    </div>

    <div
      bind:this={surfaceElement}
      class="surface"
      class:single-pane={!workspace.settings.multiPanel}
      style={`--split: ${workspace.splitRatio * 100}%;`}
    >
      <div
        class:mobile-hidden={mobilePane !== 'left'}
        class:single-hidden={!workspace.settings.multiPanel && activePane !== 'left'}
        class="pane-wrap pane-wrap-left"
      >
        <PaneEditor
          pane={workspace.panes.left}
          metrics={leftMetrics}
          active={activePane === 'left'}
          wideMode={!workspace.settings.multiPanel}
          motionEnabled={workspace.settings.motionEnabled}
          onPaneFocus={setActivePane}
          onPaneUpdate={updatePane}
          onKeySound={playKeySound}
        />
      </div>

      <button
        type="button"
        class="divider"
        class:hidden={!workspace.settings.multiPanel}
        aria-label="Drag to resize panes"
        on:pointerdown={beginDrag}
      >
        <span></span>
      </button>

      <div
        class:mobile-hidden={mobilePane !== 'right'}
        class:single-hidden={!workspace.settings.multiPanel && activePane !== 'right'}
        class="pane-wrap pane-wrap-right"
      >
        <PaneEditor
          pane={workspace.panes.right}
          metrics={rightMetrics}
          active={activePane === 'right'}
          wideMode={!workspace.settings.multiPanel}
          motionEnabled={workspace.settings.motionEnabled}
          onPaneFocus={setActivePane}
          onPaneUpdate={updatePane}
          onKeySound={playKeySound}
        />
      </div>
    </div>
  </section>

  <aside class="rail rail-right" aria-label="Theme actions">
    <IconButton label="Garden day theme" tooltipSide="left" active={workspace.settings.theme === 'garden-paper'} onClick={() => setTheme('garden-paper')}>
      <AtmoIcon name="sun" />
    </IconButton>
    <IconButton label="Moonlit theme" tooltipSide="left" active={workspace.settings.theme === 'moonlit'} onClick={() => setTheme('moonlit')}>
      <AtmoIcon name="moon" />
    </IconButton>
    <div class="rail-spacer"></div>
    <IconButton label="Garden paper atmosphere" tooltipSide="left" active={workspace.settings.motionEnabled} onClick={() => {
      workspace = { ...workspace, settings: { ...workspace.settings, motionEnabled: !workspace.settings.motionEnabled } };
      session.replace(workspace);
    }}>
      <AtmoIcon name="leaf" />
    </IconButton>
  </aside>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    min-width: 320px;
    overflow: hidden;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background:
      linear-gradient(118deg, rgba(223, 232, 216, 0.18), rgba(247, 244, 235, 0.08) 48%, rgba(240, 222, 208, 0.18)),
      url('/images/garden-paper-bg.png') center / cover no-repeat,
      #dfe8d8;
  }

  :global(body:has(.app-shell[data-theme='moonlit'])) {
    background:
      linear-gradient(118deg, rgba(17, 24, 34, 0.35), rgba(29, 36, 48, 0.22) 48%, rgba(43, 36, 38, 0.35)),
      url('/images/moonlit-bg.png') center / cover no-repeat,
      #111822;
  }

  :global(body:has(.app-shell[data-theme='garden-paper'])) {
    background:
      linear-gradient(118deg, rgba(223, 232, 216, 0.18), rgba(247, 244, 235, 0.08) 48%, rgba(240, 222, 208, 0.18)),
      url('/images/garden-paper-bg.png') center / cover no-repeat,
      #dfe8d8;
  }

  .app-shell {
    --desktop-titlebar-height: 2.65rem;
    --text: #617068;
    --muted: #8e9b90;
    --counter: #9a7a65;
    --icon: rgba(82, 99, 88, 0.65);
    --icon-strong: rgba(55, 72, 62, 0.82);
    --caret: #43a684;
    --right-caret: #ef8b62;
    --scene-glow-left: rgba(213, 230, 204, 0.78);
    --scene-glow-center: rgba(250, 248, 240, 0.58);
    --scene-glow-right: rgba(244, 221, 202, 0.78);
    --shell-margin-y: clamp(1rem, 2.2vw, 1.8rem);
    --shell-margin-x: clamp(0.8rem, 1.6vw, 1.4rem);
    --inner-pad-y: clamp(0.38rem, 0.72vw, 0.62rem);
    --left-rail-width: 4.2rem;
    --right-rail-width: 4.2rem;
    --stage-glass: rgba(255, 255, 255, 0.055);
    --stage-border: rgba(116, 127, 111, 0.15);
    --surface-glass: rgba(255, 255, 255, 0.13);
    --surface-border: rgba(112, 123, 111, 0.14);
    --surface-highlight: rgba(255, 255, 255, 0.22);
    --switcher-glass: rgba(255, 255, 255, 0.5);
    --switcher-border: rgba(130, 142, 126, 0.18);
    --switcher-active: rgba(255, 255, 255, 0.68);
    --switcher-shadow: rgba(73, 84, 74, 0.12);
    --divider-line: rgba(125, 126, 118, 0.16);
    --divider-handle: rgba(255, 255, 255, 0.38);
    --pane-left-a: rgba(250, 253, 247, 0.34);
    --pane-left-b: rgba(226, 241, 229, 0.2);
    --pane-right-a: rgba(255, 250, 242, 0.36);
    --pane-right-b: rgba(255, 232, 211, 0.2);
    height: calc(100vh - (2 * var(--shell-margin-y)));
    min-height: 42rem;
    position: relative;
    display: grid;
    grid-template-columns: var(--left-rail-width) minmax(0, 1fr) var(--right-rail-width);
    gap: 0;
    margin: var(--shell-margin-y) var(--shell-margin-x);
    padding: var(--inner-pad-y) 0;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--stage-border);
    border-radius: 1.1rem;
    background:
      linear-gradient(90deg, rgba(228, 241, 222, 0.12), rgba(255, 255, 255, 0.035) 49%, rgba(246, 224, 202, 0.12)),
      var(--stage-glass);
    box-shadow:
      0 1.4rem 4rem rgba(69, 79, 68, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px) saturate(1.04);
    color: var(--text);
  }

  :global(body.atmopad-desktop) .app-shell {
    height: calc(100vh - (2 * var(--shell-margin-y)) - var(--desktop-titlebar-height));
    margin-top: calc(var(--shell-margin-y) + var(--desktop-titlebar-height));
  }

  .app-shell[data-theme='moonlit'] {
    --text: #d9d5c8;
    --muted: #989fb2;
    --counter: #bda988;
    --icon: rgba(216, 215, 200, 0.58);
    --icon-strong: rgba(248, 244, 225, 0.86);
    --caret: #8bb8e8;
    --right-caret: #e4a777;
    --scene-glow-left: rgba(18, 29, 35, 0.88);
    --scene-glow-center: rgba(21, 25, 32, 0.78);
    --scene-glow-right: rgba(49, 35, 32, 0.88);
    --stage-glass: rgba(20, 26, 31, 0.08);
    --stage-border: rgba(255, 255, 255, 0.1);
    --surface-glass: rgba(15, 20, 25, 0.18);
    --surface-border: rgba(255, 255, 255, 0.12);
    --surface-highlight: rgba(255, 255, 255, 0.08);
    --switcher-glass: rgba(16, 22, 28, 0.62);
    --switcher-border: rgba(255, 255, 255, 0.12);
    --switcher-active: rgba(139, 169, 186, 0.22);
    --switcher-shadow: rgba(0, 0, 0, 0.28);
    --divider-line: rgba(238, 226, 203, 0.13);
    --divider-handle: rgba(26, 29, 35, 0.34);
    --pane-left-a: rgba(16, 31, 36, 0.28);
    --pane-left-b: rgba(18, 44, 47, 0.18);
    --pane-right-a: rgba(45, 34, 33, 0.26);
    --pane-right-b: rgba(70, 46, 33, 0.18);
    background:
      linear-gradient(90deg, rgba(64, 116, 118, 0.08), rgba(255, 255, 255, 0.02) 49%, rgba(155, 86, 49, 0.08)),
      var(--stage-glass);
    box-shadow:
      0 1.4rem 4rem rgba(0, 0, 0, 0.18),
      inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .ambient {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    filter: blur(16px);
    opacity: 0.16;
  }

  .ambient-left {
    left: -5rem;
    bottom: -4rem;
    width: 18rem;
    height: 20rem;
    background:
      radial-gradient(ellipse at 45% 82%, rgba(96, 133, 76, 0.45), transparent 31%),
      radial-gradient(ellipse at 20% 40%, rgba(96, 133, 76, 0.2), transparent 24%);
  }

  .ambient-right {
    right: -4rem;
    top: -4rem;
    width: 18rem;
    height: 18rem;
    background: radial-gradient(circle, rgba(225, 182, 139, 0.36), transparent 52%);
  }

  .rail {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.1rem;
    padding: 1.35rem 0.45rem;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }

  .rail-group {
    display: grid;
    gap: 0.82rem;
  }

  .rail-spacer {
    flex: 1;
  }

  .workspace-frame {
    position: relative;
    z-index: 2;
    min-width: 0;
    min-height: 0;
    height: 100%;
    padding-right: var(--workspace-end-gap, 0);
  }

  .surface {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, var(--split)) 0 minmax(0, calc(100% - var(--split)));
    overflow: hidden;
    border: 1px solid var(--surface-border);
    border-radius: 0.95rem;
    background:
      linear-gradient(90deg, rgba(237, 249, 234, 0.05), rgba(255, 255, 255, 0.02) 50%, rgba(255, 228, 207, 0.06)),
      var(--surface-glass);
    box-shadow: inset 0 0 0 1px var(--surface-highlight);
    backdrop-filter: blur(14px) saturate(1.08);
  }

  .surface.single-pane {
    grid-template-columns: minmax(0, 1fr);
  }

  .app-shell[data-theme='moonlit'] .surface {
    background:
      linear-gradient(90deg, rgba(70, 117, 117, 0.045), rgba(255, 255, 255, 0.012) 50%, rgba(163, 92, 54, 0.045)),
      var(--surface-glass);
    box-shadow: inset 0 0 0 1px var(--surface-highlight);
  }

  .pane-wrap {
    min-width: 0;
    min-height: 0;
  }

  .single-hidden,
  .hidden {
    display: none;
  }

  .pane-wrap-left {
    --caret: #42a981;
  }

  .pane-wrap-right {
    --caret: var(--right-caret);
  }

  .divider {
    position: relative;
    z-index: 4;
    width: 1px;
    height: 100%;
    border: 0;
    padding: 0;
    color: rgba(143, 137, 124, 0.58);
    background: var(--divider-line);
    cursor: col-resize;
  }

  .divider span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1.1rem;
    height: 3rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(151, 139, 121, 0.16);
    border-radius: 999px;
    background: var(--divider-handle);
    backdrop-filter: blur(18px) saturate(1.14);
    box-shadow: 0 0.8rem 2.1rem rgba(81, 84, 76, 0.13);
    transform: translate(-50%, -50%);
  }

  .divider span::before {
    content: '';
    width: 0.22rem;
    height: 1.1rem;
    background-image: radial-gradient(currentColor 1px, transparent 1px);
    background-size: 0.22rem 0.22rem;
    opacity: 0.68;
  }

  .mobile-switch {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      scroll-behavior: auto !important;
      transition-duration: 0.001ms !important;
      animation-duration: 0.001ms !important;
    }
  }

  @media (max-width: 760px) {
    :global(body) {
      overflow: auto;
    }

    .app-shell {
      --desktop-titlebar-height: 2.45rem;
      --shell-margin-y: 0.8rem;
      --shell-margin-x: 0.8rem;
      --inner-pad-y: 0.45rem;
      --left-rail-width: 3.35rem;
      --right-rail-width: 0rem;
      --workspace-end-gap: 0.45rem;
      grid-template-columns: 3.35rem minmax(0, 1fr);
    }

    .rail-right {
      display: none;
    }

    .surface {
      height: 100%;
      min-height: 32rem;
      grid-template-columns: minmax(0, 1fr);
    }

    .divider {
      display: none;
    }

    .mobile-hidden {
      display: none;
    }

    .mobile-switch {
      position: absolute;
      top: 1rem;
      left: 50%;
      z-index: 8;
      display: flex;
      gap: 0.35rem;
      padding: 0.28rem;
      border: 1px solid var(--switcher-border);
      border-radius: 999px;
      background: var(--switcher-glass);
      box-shadow: 0 0.7rem 1.6rem var(--switcher-shadow);
      transform: translateX(-50%);
      backdrop-filter: blur(14px) saturate(1.08);
    }

    .mobile-switch button {
      border: 0;
      border-radius: 999px;
      padding: 0.42rem 0.78rem;
      color: var(--icon);
      background: transparent;
      font: 600 0.72rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
    }

    .mobile-switch button.active {
      color: var(--icon-strong);
      background: var(--switcher-active);
    }
  }
</style>
