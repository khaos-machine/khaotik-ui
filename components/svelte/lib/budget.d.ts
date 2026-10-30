export function dollars(usd: string): string;
export function budgetText(budget: {
    kind: string;
    usd?: string;
    spentUsd?: string;
    remainingUsd?: string;
} | null): string;
export function budgetSpent(budget: {
    kind: string;
    usd?: string;
    spentUsd?: string;
    remainingUsd?: string;
} | null): boolean;
