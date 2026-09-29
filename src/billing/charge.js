// Protected path: src/billing/**
//
// Charges are the one thing in this demo the intent contract fences off.
// The planted pull request proof/outside-the-contract edits this file
// without a contract that approves it.

export function charge(amountCents, currency, discountPercent = 0) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("amountCents must be a positive integer");
  }
  if (typeof currency !== "string" || currency.length !== 3) {
    throw new Error("currency must be a 3-letter code");
  }
  const discounted = Math.round(amountCents * (1 - discountPercent / 100));
  return {
    amountCents: discounted,
    currency: currency.toUpperCase(),
    status: "charged"
  };
}
