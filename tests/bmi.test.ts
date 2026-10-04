import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateBMI, normalizeHistory } from "../lib/bmi.ts";

test("accepts decimals and trims saved input", () => {
  assert.equal(calculateBMI(" 170.5 ", "65.5")?.bmi, "22.53");
  assert.equal(calculateBMI(" 170.5 ", "65.5")?.height, "170.5");
});

test("rejects empty, partial, nonpositive, and nonfinite measurements", () => {
  for (const input of ["", " ", "0", "-1", "abc", "170cm", "Infinity", "1e999"]) {
    assert.equal(calculateBMI(input, "65"), null);
    assert.equal(calculateBMI("170", input), null);
  }
  assert.equal(calculateBMI("1e-200", "65"), null);
  assert.equal(calculateBMI("1e100", "65"), null);
});

test("classifies the raw BMI at every adult threshold", () => {
  for (const [weight, level] of [[18.499, 0], [18.5, 1], [23.999, 1], [24, 2], [26.999, 2], [27, 3]]) {
    assert.equal(calculateBMI("100", String(weight))?.bmiLevel, level);
  }
});

const record = { ...calculateBMI("170", "65")!, id: "one", date: "2026/10/5" };

test("drops malformed history and duplicates, and derives trusted display values", () => {
  const records = normalizeHistory([null, {}, { id: "bad", date: "today" },
    { ...record, color: "red", description: "bad", bmiLevel: 99 }, record,
    { ...record, id: "negative", height: "-170" }]);
  assert.equal(records.length, 1);
  assert.equal(records[0].description, "理想");
  assert.equal(records[0].color, "#86D73E");
});

test("keeps only the latest 15 valid records", () => {
  const records = normalizeHistory(Array.from({ length: 20 }, (_, index) => ({ ...record, id: String(index) })));
  assert.equal(records.length, 15);
  assert.equal(records[0].id, "0");
  assert.equal(records.at(-1)?.id, "14");
});

test("migrates sparse legacy records without walking maxIdx", () => {
  const records = normalizeHistory({ maxIdx: Number.MAX_SAFE_INTEGER,
    data: { "2": record, "5": record, "not-an-index": record } });
  assert.deepEqual(records.map((item) => item.id), ["5", "2"]);
  for (const invalid of [null, 5, { maxIdx: Infinity, data: {} }, { maxIdx: 4, data: null }]) {
    assert.deepEqual(normalizeHistory(invalid), []);
  }
});
