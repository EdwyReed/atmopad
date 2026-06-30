<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Editor, type JSONContent } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import CharacterCount from '@tiptap/extension-character-count';
  import Placeholder from '@tiptap/extension-placeholder';
  import Typography from '@tiptap/extension-typography';

  import type { PaneId, PaneSnapshot, TextMetrics } from '$lib/workspace/workspace';

  export let pane: PaneSnapshot;
  export let metrics: TextMetrics;
  export let active = false;
  export let wideMode = false;
  export let motionEnabled = true;
  export let onPaneFocus: (id: PaneId) => void;
  export let onPaneUpdate: (
    id: PaneId,
    update: { contentJson: unknown; plainText: string; html: string }
  ) => void;
  export let onKeySound: (key: string) => void;

  let editorElement: HTMLDivElement;
  let editor: Editor | null = null;
  let toolbarOpen = false;

  $: if (editor && editor.isEditable) {
    toolbarOpen = !editor.state.selection.empty;
  }

  onMount(() => {
    editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          }
        }),
        Typography,
        CharacterCount,
        Placeholder.configure({
          placeholder: pane.id === 'left' ? 'Write something...' : 'Keep writing...'
        })
      ],
      content: pane.contentJson as JSONContent,
      editorProps: {
        attributes: {
          'aria-label': pane.id === 'left' ? 'Left writing pane' : 'Right writing pane',
          class: 'atmopad-prosemirror'
        },
        handleKeyDown(_, event) {
          onKeySound(event.key);
          return false;
        },
        handleDOMEvents: {
          focus: () => {
            onPaneFocus(pane.id);
            return false;
          }
        }
      },
      onSelectionUpdate: ({ editor }) => {
        toolbarOpen = !editor.state.selection.empty;
      },
      onUpdate: ({ editor }) => {
        onPaneUpdate(pane.id, {
          contentJson: editor.getJSON(),
          plainText: editor.getText({ blockSeparator: '\n' }),
          html: editor.getHTML()
        });
      }
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });

  function command(action: 'bold' | 'italic' | 'h2' | 'bullet' | 'ordered' | 'quote' | 'undo' | 'redo') {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (action === 'bold') chain.toggleBold().run();
    if (action === 'italic') chain.toggleItalic().run();
    if (action === 'h2') chain.toggleHeading({ level: 2 }).run();
    if (action === 'bullet') chain.toggleBulletList().run();
    if (action === 'ordered') chain.toggleOrderedList().run();
    if (action === 'quote') chain.toggleBlockquote().run();
    if (action === 'undo') chain.undo().run();
    if (action === 'redo') chain.redo().run();
  }
</script>

<section class:active class:wide-mode={wideMode} class:motion={motionEnabled} class="pane pane-{pane.id}">
  {#if toolbarOpen}
    <div class="bubble-toolbar" aria-label="{pane.title} formatting toolbar">
      <button type="button" on:click={() => command('bold')} aria-label="Bold">B</button>
      <button type="button" on:click={() => command('italic')} aria-label="Italic"><i>I</i></button>
      <button type="button" on:click={() => command('h2')} aria-label="Heading">H</button>
      <button type="button" on:click={() => command('bullet')} aria-label="Bullet list">•</button>
      <button type="button" on:click={() => command('ordered')} aria-label="Ordered list">1.</button>
      <button type="button" on:click={() => command('quote')} aria-label="Quote">“”</button>
      <button type="button" on:click={() => command('undo')} aria-label="Undo">↶</button>
      <button type="button" on:click={() => command('redo')} aria-label="Redo">↷</button>
    </div>
  {/if}

  <div class="editor-scroll">
    <div bind:this={editorElement} class="editor-host"></div>
  </div>

  <footer class="pane-counters" aria-label="{pane.title} counters">
    <span>{metrics.words} words</span>
    <span>{metrics.characters} characters</span>
    <span>{metrics.readingTime} reading time</span>
  </footer>
</section>

<style>
  .pane {
    position: relative;
    height: 100%;
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr auto;
    background: linear-gradient(110deg, var(--pane-tint-a), var(--pane-tint-b));
    color: var(--text);
    overflow: hidden;
    backdrop-filter: blur(14px) saturate(1.08);
  }

  .pane::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.1;
    background-image:
      linear-gradient(rgba(99, 118, 102, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 118, 102, 0.035) 1px, transparent 1px);
    background-size: 18px 18px;
  }

  .pane-left {
    --pane-tint-a: var(--pane-left-a);
    --pane-tint-b: var(--pane-left-b);
  }

  .pane-right {
    --pane-tint-a: var(--pane-right-a);
    --pane-tint-b: var(--pane-right-b);
  }

  .editor-scroll {
    position: relative;
    z-index: 1;
    min-height: 0;
    overflow: auto;
    padding-block: clamp(4.5rem, 8vh, 6.6rem) 3.5rem;
    padding-inline: clamp(1.6rem, 8%, 5.4rem);
    scrollbar-width: thin;
    scrollbar-color: rgba(113, 128, 114, 0.18) transparent;
  }

  .pane.wide-mode .editor-scroll {
    padding-inline: clamp(3.2rem, 16%, 13rem);
  }

  .editor-host {
    max-width: 38rem;
    min-height: 100%;
  }

  .pane.wide-mode .editor-host {
    width: min(100%, 42rem);
    max-width: none;
    margin-inline: auto;
  }

  :global(.atmopad-prosemirror) {
    min-height: 34rem;
    outline: none;
    caret-color: var(--caret);
    font-family: 'Atkinson Hyperlegible', 'Inter', ui-sans-serif, system-ui, sans-serif;
    font-size: clamp(1.02rem, 1vw, 1.16rem);
    line-height: 1.55;
    color: color-mix(in srgb, var(--text) 82%, transparent);
  }

  :global(.atmopad-prosemirror p) {
    margin: 0 0 0.68rem;
  }

  :global(.atmopad-prosemirror h1),
  :global(.atmopad-prosemirror h2),
  :global(.atmopad-prosemirror h3) {
    margin: 0 0 1.1rem;
    line-height: 1.35;
    font-weight: 600;
    color: color-mix(in srgb, var(--text) 88%, transparent);
  }

  :global(.atmopad-prosemirror h2) {
    font-size: 1.44rem;
  }

  :global(.atmopad-prosemirror ul),
  :global(.atmopad-prosemirror ol) {
    margin: 0 0 1.2rem;
    padding-left: 1.3rem;
  }

  :global(.atmopad-prosemirror li::marker) {
    color: var(--caret);
  }

  :global(.atmopad-prosemirror blockquote) {
    margin: 1.35rem 0;
    padding-left: 1rem;
    border-left: 2px solid color-mix(in srgb, var(--caret) 58%, transparent);
    color: color-mix(in srgb, var(--text) 70%, transparent);
  }

  :global(.atmopad-prosemirror strong) {
    font-weight: 700;
  }

  :global(.atmopad-prosemirror em) {
    color: color-mix(in srgb, var(--text) 76%, var(--caret));
  }

  :global(.atmopad-prosemirror .is-empty::before) {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    color: color-mix(in srgb, var(--muted) 54%, transparent);
  }

  :global(.motion .atmopad-prosemirror .ProseMirror-focused) {
    transition: color 160ms ease;
  }

  .bubble-toolbar {
    position: absolute;
    top: 2.2rem;
    left: 50%;
    z-index: 5;
    display: flex;
    gap: 0.2rem;
    padding: 0.36rem;
    border: 1px solid rgba(139, 151, 138, 0.18);
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface-glass) 58%, rgba(255, 255, 255, 0.48));
    box-shadow: 0 0.85rem 2.2rem rgba(72, 83, 76, 0.12);
    backdrop-filter: blur(22px) saturate(1.16);
    transform: translateX(-50%);
  }

  .bubble-toolbar button {
    width: 1.85rem;
    height: 1.85rem;
    border: 0;
    border-radius: 999px;
    color: var(--icon);
    background: transparent;
    font: 600 0.76rem/1 ui-sans-serif, system-ui, sans-serif;
    cursor: pointer;
  }

  .bubble-toolbar button:hover {
    background: rgba(132, 151, 132, 0.13);
  }

  .pane-counters {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.34rem clamp(1.2rem, 3.4vw, 3.4rem);
    align-items: center;
    min-height: 2.8rem;
    padding: 0.36rem clamp(1.1rem, 3vw, 3.2rem);
    border-top: 1px solid color-mix(in srgb, var(--surface-border) 70%, transparent);
    background: color-mix(in srgb, var(--surface-glass) 16%, transparent);
    backdrop-filter: blur(16px);
    color: color-mix(in srgb, var(--counter) 86%, transparent);
    font: 500 0.72rem/1.2 'Inter', ui-sans-serif, system-ui, sans-serif;
    letter-spacing: 0.05em;
  }

  .pane-counters span {
    white-space: nowrap;
  }

  @media (max-width: 760px) {
    .editor-scroll {
      padding-block: 4.6rem 3.35rem;
      padding-inline: 5.5%;
    }

    .pane.wide-mode .editor-scroll {
      padding-inline: 5.5%;
    }

    .pane.wide-mode .editor-host {
      width: 100%;
    }

    :global(.atmopad-prosemirror) {
      font-size: 0.82rem;
    }

    .pane-counters {
      gap: 0.28rem 0.8rem;
      justify-content: center;
      padding: 0.34rem 0.85rem;
      font-size: 0.62rem;
    }
  }
</style>
