import {cards} from "../data/bankCards";    

export function checkPin(cardNumber: string, pin: string): boolean {
    const card = cards.find(card => card.cardNumber === cardNumber);
    if (!card || card.isBlocked) {
        return false;
    }

    if (card.pin === pin) {
        card.failedPinAttempts = 0;
        return true;
    }

    card.failedPinAttempts += 1;

    if (card.failedPinAttempts >= 3) {
        card.isBlocked = true;
    }

    return false;
}