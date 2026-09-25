import promptSync from "prompt-sync";
import { ATM } from "./atm/ATM";

const prompt = promptSync({ sigint: true });
const atm = new ATM();

function isYes(answer: string): boolean {
    const normalizedAnswer = answer.trim().toLowerCase();

    return normalizedAnswer === "y" || normalizedAnswer === "yes";
}

function authenticate(): boolean {
    while (true) {
        const pin = prompt("Введите PIN: ").trim();

        if (atm.checkPin(pin)) {
            console.log("PIN верный.");
            return true;
        }

        if (atm.isCardBlocked()) {
            console.log("Карта заблокирована после 3 неправильных попыток.");
            return false;
        }

        console.log(
            `Неверный PIN. Осталось попыток: ${atm.getRemainingPinAttempts()}`
        );
    }
}

function readAmount(): number {
    while (true) {
        const input = prompt("Введите сумму для снятия: ").trim();
        const amount = Number(input);

        if (Number.isInteger(amount) && amount > 0) {
            return amount;
        }

        console.log("Введите положительное целое число.");
    }
}

function showDispensedCash(): void {
    const inventory = atm.getBanknoteInventory();

    console.log("Купюры, оставшиеся в банкомате:");

    for (const banknote of inventory) {
        console.log(
            `${banknote.denomination} грн: ${banknote.quantity} шт.`
        );
    }
}

function doCardSession(): void {
    while (true) {
        console.log("\nВыберите операцию:");
        console.log("1 - Проверить баланс");
        console.log("2 - Снять деньги");
        console.log("3 - Завершить работу с картой");

        const operation = prompt("Ваш выбор: ").trim();

        if (operation === "1") {
            const balance = atm.getBalance();

            if (balance !== null) {
                console.log(`Ваш баланс: ${balance} грн.`);
            }
        } else if (operation === "2") {
            const amount = readAmount();
            const result = atm.withdrawCash(amount);

            console.log(result.message);

            if (result.success) {
                console.log("Выдано:");

                for (const banknote of result.dispensed) {
                    console.log(
                        `${banknote.denomination} грн x ${banknote.quantity}`
                    );
                }

                const balance = atm.getBalance();

                if (balance !== null) {
                    console.log(`Новый баланс: ${balance} грн.`);
                }

                showDispensedCash();
            }
        } else if (operation === "3") {
            break;
        } else {
            console.log("Неизвестная операция.");
            continue;
        }

        const continueWorking = prompt(
            "\nПродолжить работу с этой картой? (y/n): "
        );

        if (!isYes(continueWorking)) {
            break;
        }

        console.log("Для продолжения работы снова введите PIN.");

        if (!authenticate()) {
            break;
        }
    }

    atm.returnCard();
    console.log("Карта возвращена.");
}

while (true) {
    console.log("\n===== БАНКОМАТ =====");

    const cardNumber = prompt("Введите номер карты: ").trim();

    if (!atm.insertCard(cardNumber)) {
        console.log("Карта не найдена или заблокирована.");

        const retry = prompt("Попробовать другую карту? (y/n): ");

        if (!isYes(retry)) {
            break;
        }

        continue;
    }

    console.log("Карта принята.");

    if (!authenticate()) {
        atm.returnCard();

        const retry = prompt("Попробовать другую карту? (y/n): ");

        if (!isYes(retry)) {
            break;
        }

        continue;
    }

    doCardSession();

    const newSession = prompt(
        "\nНачать обслуживание новой карты? (y/n): "
    );

    if (!isYes(newSession)) {
        break;
    }
}

console.log("Работа банкомата завершена.");
