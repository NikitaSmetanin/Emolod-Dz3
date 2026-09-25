import {Banknote} from "../models/Banknote";
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getBanknotes(): Banknote[] {
  return [
    { denomination: 100, quantity: getRandomInt(0, 100) },
    { denomination: 200, quantity: getRandomInt(0, 100) },
    { denomination: 500, quantity: getRandomInt(0, 100) },
    { denomination: 1000, quantity: getRandomInt(0, 100) },
  ];
}