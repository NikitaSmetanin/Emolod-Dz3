import { Card } from "../models/Card";
import { Banknote } from "../models/Banknote";

const MAX_BANKNOTES_PER_WITHDRAWAL = 30;

export function checkBallance(card: Card): number {
    return card.balance;
}

export function getCash(
    card: Card,
    amount: number,
    banknotes: Banknote[]
): Banknote[] | null {
    if (
        !Number.isInteger(amount) ||
        amount <= 0 ||
        amount % 100 !== 0 ||
        amount > card.balance ||
        amount > 30000
    ) {
        return null;
    }

    const sortedBanknotes = [...banknotes].sort(
        (a, b) => b.denomination - a.denomination
    );

    const counts = new Array<number>(sortedBanknotes.length).fill(0);

    function findCombination(
        index: number,
        remainingAmount: number,
        remainingNotes: number
    ): boolean {
        if (remainingAmount === 0) {
            return true;
        }

        if (
            index >= sortedBanknotes.length ||
            remainingNotes === 0 ||
            remainingAmount < 0
        ) {
            return false;
        }

        const banknote = sortedBanknotes[index];
        const maxCount = Math.min(
            banknote.quantity,
            Math.floor(remainingAmount / banknote.denomination),
            remainingNotes
        );

        for (let count = maxCount; count >= 0; count--) {
            counts[index] = count;

            if (
                findCombination(
                    index + 1,
                    remainingAmount - count * banknote.denomination,
                    remainingNotes - count
                )
            ) {
                return true;
            }
        }

        counts[index] = 0;
        return false;
    }

    if (!findCombination(0, amount, MAX_BANKNOTES_PER_WITHDRAWAL)) {
        return null;
    }

    return sortedBanknotes
        .map((banknote, index) => ({
            denomination: banknote.denomination,
            quantity: counts[index],
        }))
        .filter(banknote => banknote.quantity > 0);
}
