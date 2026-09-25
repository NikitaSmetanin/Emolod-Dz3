import {Card} from "../models/Card";
import {cards} from "../data/bankCards";

export function checkCard(cardNumber: string): boolean {
    const card = cards.find(card => card.cardNumber === cardNumber);

    if (!card || card.isBlocked) {
        return false;
    }
    return true;
}