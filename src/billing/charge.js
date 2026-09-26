// Protected path: src/billing/**
//
// Charges are the one thing in this demo the intent contract fences off.
// The planted pull request proof/outside-the-contract edits this file
// without a contract that approves it.

export function charge(amountCents, currency) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("amountCents must be a positive integer");
  }
  if (typeof currency !== "string" || currency.length !== 3) {
    throw new Error("currency must be a 3-letter code");
  }
  return {
    amountCents,
    currency: currency.toUpperCase(),
    status: "charged"
  };
}
