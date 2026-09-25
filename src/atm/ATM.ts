import { cards } from "../data/bankCards";
import { Card } from "../models/Card";
import { Banknote } from "../models/Banknote";
import { getBanknotes } from "../services/BanknoteService";
import { checkCard } from "../services/CardService";
import { checkBallance, getCash } from "../models/CalculationService";
import { checkPin } from "../services/PinService";

export type WithdrawalResult = {
    success: boolean;
    message: string;
    dispensed: Banknote[];
};

export class ATM {
    public readonly banknotes: Banknote[];
    public readonly cards: Card[];

    private currentCard: Card | null = null;

    constructor() {
        this.banknotes = getBanknotes();
        this.cards = cards;
    }

    public insertCard(cardNumber: string): boolean {
        if (!checkCard(cardNumber)) {
            this.currentCard = null;
            return false;
        }

        this.currentCard =
            this.cards.find(card => card.cardNumber === cardNumber) ?? null;

        return this.currentCard !== null;
    }

    public checkPin(pin: string): boolean {
        if (!this.currentCard) {
            return false;
        }

        return checkPin(this.currentCard.cardNumber, pin);
    }

    public isCardBlocked(): boolean {
        return this.currentCard?.isBlocked ?? false;
    }

    public getRemainingPinAttempts(): number {
        if (!this.currentCard) {
            return 0;
        }

        return Math.max(0, 3 - this.currentCard.failedPinAttempts);
    }

    public getBalance(): number | null {
        if (!this.currentCard) {
            return null;
        }

        return checkBallance(this.currentCard);
    }

    public withdrawCash(amount: number): WithdrawalResult {
        if (!this.currentCard) {
            return {
                success: false,
                message: "Карта не вставлена.",
                dispensed: [],
            };
        }

        if (!Number.isInteger(amount) || amount <= 0) {
            return {
                success: false,
                message: "Сумма должна быть положительным целым числом.",
                dispensed: [],
            };
        }

        if (amount % 100 !== 0) {
            return {
                success: false,
                message: "Банкомат выдает только суммы, кратные 100.",
                dispensed: [],
            };
        }

        if (amount > this.currentCard.balance) {
            return {
                success: false,
                message: "Недостаточно средств на карте.",
                dispensed: [],
            };
        }

        const dispensed = getCash(
            this.currentCard,
            amount,
            this.banknotes
        );

        if (!dispensed) {
            return {
                success: false,
                message:
                    "Банкомат не может выдать эту сумму из имеющихся купюр.",
                dispensed: [],
            };
        }

        for (const dispensedBanknote of dispensed) {
            const banknote = this.banknotes.find(
                item =>
                    item.denomination === dispensedBanknote.denomination
            );

            if (banknote) {
                banknote.quantity -= dispensedBanknote.quantity;
            }
        }

        this.currentCard.balance -= amount;

        return {
            success: true,
            message: "Деньги успешно выданы.",
            dispensed,
        };
    }

    public getBanknoteInventory(): Banknote[] {
        return this.banknotes.map(banknote => ({
            denomination: banknote.denomination,
            quantity: banknote.quantity,
        }));
    }

    public returnCard(): void {
        this.currentCard = null;
    }
}
