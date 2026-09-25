import {cards} from "../data/bankCards";
import {Card} from "../models/Card";
import {Banknote} from "../models/Banknote";
import {getBanknotes} from "../services/BanknoteService";
import {checkCard} from "../services/CardService";
import {checkBallance, getCash} from "../models/CalculationService";
import {checkPin} from "../services/PinService";

let ATM = {
    banknotes: getBanknotes(),
    cards: cards,


