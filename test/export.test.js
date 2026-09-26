import test from "node:test";
import assert from "node:assert/strict";
import { toCsv, reportFilename } from "../src/reports/export.js";
import { newId } from "../src/utils/id.js";

test("turns rows into a header plus data lines", () => {
  const csv = toCsv([
    { id: "1", name: "alpha" },
    { id: "2", name: "beta" }
  ]);
  assert.equal(csv, "id,name\n1,alpha\n2,beta");
});

test("returns an empty string for no rows", () => {
  assert.equal(toCsv([]), "");
});

test("builds a filename with a date stamp", () => {
  const name = reportFilename("reports", new Date("2026-01-15T12:00:00"));
  assert.equal(name, "reports-2026-01-15.csv");
});

test("newId prefixes a generated id", () => {
  const id = newId("rep");
  assert.match(id, /^rep_[A-Za-z0-9_-]{12}$/);
});
