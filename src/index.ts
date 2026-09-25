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
        const pin = prompt("Enter PIN: ").trim();

        if (atm.checkPin(pin)) {
            console.log("PIN is correct.");
            return true;
        }

        if (atm.isCardBlocked()) {
            console.log("Card has been blocked after 3 incorrect attempts.");
            return false;
        }

        console.log(
            `Incorrect PIN. Remaining attempts: ${atm.getRemainingPinAttempts()}`
        );
    }
}

function readAmount(): number {
    while (true) {
        const input = prompt("Enter the withdrawal amount: ").trim();
        const amount = Number(input);

        if (Number.isInteger(amount) && amount > 0) {
            return amount;
        }

        console.log("Please enter a positive whole number.");
    }
}

function showDispensedCash(): void {
    const inventory = atm.getBanknoteInventory();

    console.log("Banknotes remaining in the ATM:");

    for (const banknote of inventory) {
        console.log(
            `${banknote.denomination} UAH: ${banknote.quantity} pcs.`
        );
    }
}

function doCardSession(): void {
    while (true) {
        console.log("\nSelect an operation:");
        console.log("1 - Check balance");
        console.log("2 - Withdraw cash");
        console.log("3 - Finish session");

        const operation = prompt("Your choice: ").trim();

        if (operation === "1") {
            const balance = atm.getBalance();

            if (balance !== null) {
                console.log(`Your balance: ${balance} UAH.`);
            }
        } else if (operation === "2") {
            const amount = readAmount();
            const result = atm.withdrawCash(amount);

            console.log(result.message);

            if (result.success) {
                console.log("Dispensed:");

                for (const banknote of result.dispensed) {
                    console.log(
                        `${banknote.denomination} UAH x ${banknote.quantity}`
                    );
                }

                const balance = atm.getBalance();

                if (balance !== null) {
                    console.log(`New balance: ${balance} UAH.`);
                }

                showDispensedCash();
            }
        } else if (operation === "3") {
            break;
        } else {
            console.log("Unknown operation.");
            continue;
        }

        const continueWorking = prompt(
            "\nContinue using this card? (y/n): "
        );

        if (!isYes(continueWorking)) {
            break;
        }

        console.log("To continue, enter your PIN again.");

        if (!authenticate()) {
            break;
        }
    }

    atm.returnCard();
    console.log("Card returned.");
}

while (true) {
    console.log("\n===== ATM =====");

    const cardNumber = prompt("Enter card number: ").trim();

    if (!atm.insertCard(cardNumber)) {
        console.log("Card not found or blocked.");

        const retry = prompt("Try another card? (y/n): ");

        if (!isYes(retry)) {
            break;
        }

        continue;
    }

    console.log("Card accepted.");

    if (!authenticate()) {
        atm.returnCard();

        const retry = prompt("Try another card? (y/n): ");

        if (!isYes(retry)) {
            break;
        }

        continue;
    }

    doCardSession();

    const newSession = prompt(
        "\nStart a new card session? (y/n): "
    );

    if (!isYes(newSession)) {
        break;
    }
}

console.log("ATM session ended.");
