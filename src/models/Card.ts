export type Card = {
  cardNumber: string;
  pin: string;
  balance: number;
  isBlocked: boolean;
  failedPinAttempts: number;
  ownerName: string;
};
