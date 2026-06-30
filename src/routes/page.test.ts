import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Page from './+page.svelte';

describe('Atmopad app shell', () => {
  it('renders two independent writing panes with per-pane counters', async () => {
    render(Page);

    expect(screen.getByLabelText('Left writing pane')).toBeInTheDocument();
    expect(screen.getByLabelText('Right writing pane')).toBeInTheDocument();
    expect(screen.getByLabelText('Left pad counters')).toBeInTheDocument();
    expect(screen.getByLabelText('Right pad counters')).toBeInTheDocument();
    expect(screen.queryByText('Left pad')).not.toBeInTheDocument();
    expect(screen.queryByText('Right pad')).not.toBeInTheDocument();
    expect(screen.getAllByText('0 words')).toHaveLength(2);
    expect(screen.getAllByText('0 characters')).toHaveLength(2);
  });
});
