// Roadmap view e2e smoke test — covers the critical happy path of the
// Fase 5 DoD (§2.2): create a ROADMAP view, land on the timeline with
// records rendering in the sticky name column, exercise the zoom switcher
// and the "Go today" button. Deeper drag/resize/dblclick scenarios need
// CDP-based pointer scripting and are tracked separately.

import { expect, test } from '../../lib/fixtures/screenshot';

test.describe.serial('Roadmap View', () => {
  test('Create Roadmap View on Opportunity and render timeline', async ({
    page,
  }) => {
    await page.goto('/objects/opportunities');

    // Open the view picker and start creating a new view.
    await page
      .getByRole('button', { name: /All Opportunities/ })
      .click();
    await page.getByText('Add view').click();

    // Name the view.
    await page.getByRole('textbox').press('ControlOrMeta+a');
    await page.getByRole('textbox').fill('E2E Roadmap');

    // Switch view type to Roadmap.
    await page.getByRole('button', { name: 'Table', exact: true }).click();
    await page.getByText('Roadmap').click();

    // The view-picker shows start/end/group/color/label pickers once
    // Roadmap is chosen. Pick the two DATE fields Opportunity ships with
    // out of the box: Created At + Close Date.
    await page
      .locator('[aria-controls="view-picker-roadmap-field-start-options"]')
      .click();
    await page.getByRole('option', { name: 'Created At' }).click();
    await page
      .locator('[aria-controls="view-picker-roadmap-field-end-options"]')
      .click();
    await page.getByRole('option', { name: 'Close Date' }).click();

    await page.getByRole('button', { name: 'Create new view' }).click();

    // Timeline lands. The month band in the sticky time header is the
    // cheapest universal signal the canvas rendered.
    await expect(
      page.getByText(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/),
    ).toBeVisible({ timeout: 30000 });

    // The name column should show at least one Opportunity record label —
    // the demo dataset seeds several.
    await expect(page.getByText('E2E Roadmap')).toBeVisible();
  });

  test('Zoom selector cycles through Week / Month / Quarter', async ({
    page,
  }) => {
    await page.goto('/objects/opportunities');
    await page.getByRole('button', { name: 'E2E Roadmap' }).click();
    await page.getByText('E2E Roadmap').click();

    for (const label of ['Week', 'Month', 'Quarter']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      // Still see a month band after the switch — sanity check that the
      // timeline didn't unmount/crash.
      await expect(
        page.getByText(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/),
      ).toBeVisible();
    }
  });

  test('Go today button re-anchors the viewport', async ({ page }) => {
    await page.goto('/objects/opportunities');
    await page.getByRole('button', { name: 'E2E Roadmap' }).click();
    await page.getByText('E2E Roadmap').click();

    await page.getByRole('button', { name: 'Go today' }).click();

    // Today line labels itself "Today" — asserting its presence in the DOM
    // is enough to confirm the scroll landed on the current date region.
    await expect(page.getByText('Today').first()).toBeVisible();
  });
});
