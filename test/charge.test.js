import test from "node:test";
import assert from "node:assert/strict";
import { charge } from "../src/billing/charge.js";

test("charges a positive amount in a 3-letter currency", () => {
  const result = charge(1200, "usd");
  assert.equal(result.amountCents, 1200);
  assert.equal(result.currency, "USD");
  assert.equal(result.status, "charged");
});

test("rejects a non-positive amount", () => {
  assert.throws(() => charge(0, "usd"));
});

test("rejects a currency that is not 3 letters", () => {
  assert.throws(() => charge(500, "us"));
});
