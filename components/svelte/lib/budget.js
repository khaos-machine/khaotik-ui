// The story budget as the writer reads it, shared by the status bar and Project Settings › Budget:
// one dollar limit (K, 2026-10-24: "one fucking number ($USD) as MAX spend").

/** @param {string} usd A decimal string, as khaosd sends money. */
export const dollars = (usd) => `$${Number(usd).toFixed(2)}`

/**
 * What the budget reads as, in the status bar and the overview's strip: "$1.23 of $5.00".
 * @param {{ kind: string, usd?: string, spentUsd?: string, remainingUsd?: string } | null} budget A `StatusBudget` (StatusBar.svelte).
 */
export const budgetText = (budget) =>
  !budget ? '' : budget.kind === 'reading' ? 'Budget' : budget.kind === 'none' ? 'No budget set' : budget.kind === 'failed' ? 'Budget unavailable'
    : `${dollars(budget.spentUsd ?? '')} of ${dollars(budget.usd ?? '')}`

/**
 * Nothing is left, as the engine says it; the amounts are never compared here.
 * @param {{ kind: string, usd?: string, spentUsd?: string, remainingUsd?: string } | null} budget A `StatusBudget` (StatusBar.svelte).
 */
export const budgetSpent = (budget) => budget?.kind === 'loaded' && Number(budget.remainingUsd) === 0
