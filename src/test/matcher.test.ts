import * as assert from "assert";
import { findMatches, TextMatch } from "../matcher";
import { FunctionTarget } from "../types";

suite("Matcher Test Suite", () => {
  const defaultTargets: FunctionTarget[] = [
    { function: "Evalue", argIndex: 1 },
    { function: "HasElement", argIndex: 1 },
    { function: "ModExp", argIndex: 1 },
  ];

  test("basic function call", () => {
    const text = "var val = Evalue(60);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 60);
  });

  test("function call with receiver", () => {
    const text = "var val = obj.Evalue(60);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 60);
  });

  test("ternary expression matches both numbers", () => {
    const text = "var val = Evalue(flag ? 30 : 31);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 2);
    const values = matches.map((m) => m.numericValue).sort((a, b) => a - b);
    assert.deepStrictEqual(values, [30, 31]);
  });

  test("variable argument does not match", () => {
    const text = "var val = Evalue(elementId);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 0);
  });

  test("multiple function calls", () => {
    const text = `
      var a = Evalue(60);
      var b = HasElement(61);
      var c = ModExp(62);
    `;
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 3);
    const values = matches.map((m) => m.numericValue).sort((a, b) => a - b);
    assert.deepStrictEqual(values, [60, 61, 62]);
  });

  test("nested function call", () => {
    const text = "var val = Evalue(GetValue(123));";
    const matches = findMatches(text, defaultTargets);

    // 123 is inside nested parentheses, should still be found
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 123);
  });

  test("second argument position", () => {
    const targets: FunctionTarget[] = [{ function: "Func", argIndex: 2 }];
    const text = 'var val = Func("str", 42);';
    const matches = findMatches(text, targets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 42);
  });

  test("dotted function name (Element.Create)", () => {
    const targets: FunctionTarget[] = [
      { function: "Element.Create", argIndex: 1 },
    ];
    const text = "var elem = Element.Create(100);";
    const matches = findMatches(text, targets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 100);
  });

  test("dotted function name with receiver", () => {
    const targets: FunctionTarget[] = [
      { function: "Element.Create", argIndex: 1 },
    ];
    const text = "var elem = obj.Element.Create(100);";
    const matches = findMatches(text, targets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 100);
  });

  test("generic function call", () => {
    const targets: FunctionTarget[] = [
      { function: "Element.Create", argIndex: 1 },
    ];
    const text = "var elem = Element.Create<T>(100);";
    const matches = findMatches(text, targets);

    // Generic type parameter should not prevent matching
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 100);
  });

  test("no match for unrelated function", () => {
    const text = "var val = SomeOtherFunction(60);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 0);
  });

  test("match offset is correct", () => {
    const text = "Evalue(42)";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].startOffset, 7); // "Evalue(" is 7 chars
    assert.strictEqual(matches[0].endOffset, 9); // "42" ends at position 9
    assert.strictEqual(text.substring(matches[0].startOffset, matches[0].endOffset), "42");
  });

  test("whitespace between function name and parenthesis", () => {
    const text = "var val = Evalue (60);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].numericValue, 60);
  });

  test("number in variable name does not match", () => {
    const text = "var val = Evalue(num123);";
    const matches = findMatches(text, defaultTargets);

    assert.strictEqual(matches.length, 0);
  });
});
