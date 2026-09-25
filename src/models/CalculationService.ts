import {Card} from "../models/Card";
import {cards} from "../data/bankCards";
import {getBanknotes} from "../services/BanknoteService";


export function checkBallance(card: Card): number {
    return card.balance;
}

export function getCash(card: Card, amount: number) {
    if (amount > card.balance) {
        throw new Error("Insufficient funds");
    }
    
}