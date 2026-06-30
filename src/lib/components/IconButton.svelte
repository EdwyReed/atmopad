<script lang="ts">
  export let label: string;
  export let active = false;
  export let disabled = false;
  export let tooltipSide: 'left' | 'right' | 'top' = 'right';
  export let onClick: () => void = () => undefined;
</script>

<button
  type="button"
  class:active
  data-tooltip-side={tooltipSide}
  {disabled}
  aria-label={label}
  on:click={onClick}
>
  <slot />
  <span class="tooltip" role="tooltip">{label}</span>
</button>

<style>
  button {
    position: relative;
    width: 2.45rem;
    height: 2.45rem;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 999px;
    color: var(--icon);
    background: transparent;
    cursor: pointer;
    outline: none;
    transition:
      color 160ms ease,
      background 160ms ease,
      box-shadow 160ms ease,
      transform 160ms ease;
  }

  button:hover,
  button:focus-visible,
  button.active {
    color: var(--icon-strong);
    background: color-mix(in srgb, var(--surface-glass) 42%, rgba(255, 255, 255, 0.34));
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, currentColor 10%, transparent),
      0 0.65rem 1.55rem color-mix(in srgb, currentColor 12%, transparent);
  }

  button:active {
    transform: translateY(1px);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.38;
  }

  .tooltip {
    position: absolute;
    z-index: 30;
    width: max-content;
    max-width: 12rem;
    padding: 0.48rem 0.66rem;
    border: 1px solid color-mix(in srgb, var(--surface-border) 68%, rgba(255, 255, 255, 0.18));
    border-radius: 0.65rem;
    color: color-mix(in srgb, var(--text) 86%, white 8%);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.055)),
      color-mix(in srgb, var(--stage-glass) 62%, rgba(255, 255, 255, 0.16));
    box-shadow:
      0 0.95rem 2.4rem rgba(43, 55, 48, 0.14),
      inset 0 0 0 1px rgba(255, 255, 255, 0.09);
    backdrop-filter: blur(18px) saturate(1.18);
    font: 600 0.68rem/1.12 Inter, ui-sans-serif, system-ui, sans-serif;
    letter-spacing: 0.015em;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(var(--tooltip-x, 0), var(--tooltip-y, 0), 0) scale(0.96);
    transition:
      opacity 150ms ease,
      transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .tooltip::before {
    content: '';
    position: absolute;
    width: 0.48rem;
    height: 0.82rem;
    border: 1px solid color-mix(in srgb, var(--surface-border) 48%, transparent);
    background: color-mix(in srgb, var(--stage-glass) 72%, rgba(255, 255, 255, 0.12));
    filter: blur(0.2px);
  }

  button[data-tooltip-side='right'] .tooltip {
    --tooltip-x: -0.18rem;
    top: 50%;
    left: calc(100% + 0.7rem);
    transform-origin: left center;
    translate: 0 -50%;
  }

  button[data-tooltip-side='right'] .tooltip::before {
    top: 50%;
    left: -0.28rem;
    border-right: 0;
    border-radius: 999px 0 0 999px;
    transform: translateY(-50%);
  }

  button[data-tooltip-side='left'] .tooltip {
    --tooltip-x: 0.18rem;
    top: 50%;
    right: calc(100% + 0.7rem);
    transform-origin: right center;
    translate: 0 -50%;
  }

  button[data-tooltip-side='left'] .tooltip::before {
    top: 50%;
    right: -0.28rem;
    border-left: 0;
    border-radius: 0 999px 999px 0;
    transform: translateY(-50%);
  }

  button[data-tooltip-side='top'] .tooltip {
    --tooltip-y: 0.16rem;
    bottom: calc(100% + 0.7rem);
    left: 50%;
    transform-origin: center bottom;
    translate: -50% 0;
  }

  button[data-tooltip-side='top'] .tooltip::before {
    bottom: -0.28rem;
    left: 50%;
    width: 0.82rem;
    height: 0.48rem;
    border-top: 0;
    border-radius: 0 0 999px 999px;
    transform: translateX(-50%);
  }

  button:hover .tooltip,
  button:focus-visible .tooltip {
    --tooltip-x: 0;
    --tooltip-y: 0;
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  @media (max-width: 760px) {
    .tooltip {
      display: none;
    }
  }
</style>
