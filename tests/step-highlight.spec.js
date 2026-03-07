import { test, expect } from '@playwright/test';

// Default program:
//   [0] MVI C 0A
//   [1] MVI A 00
//   [2] LOOP:        (label)
//   [3] ADD C
//   [4] DCR C
//   [5] JNZ LOOP
//   [6] STA 2050
//   [7] HLT
//
// The UI renders label rows with their following instruction on the same line.
// Label rows (like LOOP:) get the "coloured" class when highlighted.
// Non-label rows that follow a label are rendered as empty fragments.

test('Step-through highlights correct instruction after JNZ jump', async ({ page }) => {
  await page.goto('http://localhost:5050');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Click Assemble
  await page.locator('text=Assemble').click();
  await page.waitForTimeout(500);

  const stepForwardBtn = page.locator('.navigation-button').nth(2);

  // Helper: get the index of the highlighted (coloured) row
  async function getHighlightIndex() {
    return await page.evaluate(() => {
      const rows = document.querySelectorAll('.assembled-row');
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].classList.contains('coloured')) return i;
      }
      return -1;
    });
  }

  // Helper: get the text content of the highlighted row
  async function getHighlightText() {
    return await page.evaluate(() => {
      const row = document.querySelector('.assembled-row.coloured');
      return row ? row.textContent.trim() : null;
    });
  }

  // Helper: get register values from UI
  async function getRegisters() {
    return await page.evaluate(() => {
      const values = document.querySelectorAll('.register-value');
      // Primary registers table: A, B, C, D, E, H, L, M (indices 0-7)
      // Special registers table: PC, SP (indices 8-9)
      // Flag registers table: header row (S, Z, AC, P, CY) then value row
      const primary = document.querySelectorAll('.primary-registers .register-value');
      const special = document.querySelectorAll('.special-registers .register-value');
      const flags = document.querySelectorAll('.flag-registers .register-value');
      return {
        A: primary[0]?.textContent.trim(),
        B: primary[1]?.textContent.trim(),
        C: primary[2]?.textContent.trim(),
        D: primary[3]?.textContent.trim(),
        E: primary[4]?.textContent.trim(),
        H: primary[5]?.textContent.trim(),
        L: primary[6]?.textContent.trim(),
        M: primary[7]?.textContent.trim(),
        PC: special[0]?.textContent.trim(),
        SP: special[1]?.textContent.trim(),
        // Flags: row 0 is header (S, Z, AC, P, CY), row 1 is values
        S: flags[5]?.textContent.trim(),
        Z: flags[6]?.textContent.trim(),
        AC: flags[7]?.textContent.trim(),
        P: flags[8]?.textContent.trim(),
        CY: flags[9]?.textContent.trim(),
      };
    });
  }

  // --- First iteration ---

  // Step 1: MVI C 0A
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  let highlightText = await getHighlightText();
  let highlightIdx = await getHighlightIndex();
  console.log(`Step 1: highlight=${highlightIdx} text="${highlightText}"`);
  expect(highlightText).toContain('MVI C 0A');

  let regs = await getRegisters();
  expect(regs.C).toBe('0A');
  expect(regs.A).toBe('00');

  // Step 2: MVI A 00
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  highlightIdx = await getHighlightIndex();
  console.log(`Step 2: highlight=${highlightIdx} text="${highlightText}"`);
  expect(highlightText).toContain('MVI A 00');

  regs = await getRegisters();
  expect(regs.A).toBe('00');
  expect(regs.C).toBe('0A');

  // Step 3: ADD C (highlight should be on LOOP: row which shows "LOOP:ADD C")
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  highlightIdx = await getHighlightIndex();
  console.log(`Step 3: highlight=${highlightIdx} text="${highlightText}"`);
  expect(highlightText).toContain('LOOP:');
  expect(highlightText).toContain('ADD C');

  regs = await getRegisters();
  expect(regs.A).toBe('0A');
  expect(regs.C).toBe('0A');

  // Step 4: DCR C
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  highlightIdx = await getHighlightIndex();
  console.log(`Step 4: highlight=${highlightIdx} text="${highlightText}"`);
  expect(highlightText).toContain('DCR C');

  regs = await getRegisters();
  expect(regs.A).toBe('0A');
  expect(regs.C).toBe('09');

  // Step 5: JNZ LOOP (should highlight JNZ, not MVI A 00)
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  highlightIdx = await getHighlightIndex();
  console.log(`Step 5: highlight=${highlightIdx} text="${highlightText}"`);
  expect(highlightText).toContain('JNZ LOOP');
  // THIS IS THE KEY ASSERTION: JNZ should NOT highlight MVI A 00
  expect(highlightText).not.toContain('MVI');

  regs = await getRegisters();
  expect(regs.A).toBe('0A');
  expect(regs.C).toBe('09');

  // --- Second iteration: after JNZ jumped back to LOOP ---

  // Step 6: ADD C (should highlight LOOP: ADD C, not MVI A 00)
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  highlightIdx = await getHighlightIndex();
  console.log(`Step 6: highlight=${highlightIdx} text="${highlightText}"`);
  expect(highlightText).toContain('LOOP:');
  expect(highlightText).toContain('ADD C');
  // Must NOT be on MVI A 00
  expect(highlightText).not.toContain('MVI');

  regs = await getRegisters();
  expect(regs.A).toBe('13');
  expect(regs.C).toBe('09');

  // Step 7: DCR C
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  console.log(`Step 7: text="${highlightText}"`);
  expect(highlightText).toContain('DCR C');

  regs = await getRegisters();
  expect(regs.A).toBe('13');
  expect(regs.C).toBe('08');

  // Step 8: JNZ LOOP (second time)
  await stepForwardBtn.click();
  await page.waitForTimeout(200);
  highlightText = await getHighlightText();
  console.log(`Step 8: text="${highlightText}"`);
  expect(highlightText).toContain('JNZ LOOP');
});

test('Full execution: registers correct at HLT', async ({ page }) => {
  await page.goto('http://localhost:5050');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Click Assemble
  await page.locator('text=Assemble').click();
  await page.waitForTimeout(500);

  // Click Run (play button)
  const runBtn = page.locator('.navigation-button').nth(1);
  await runBtn.click();
  await page.waitForTimeout(1000);

  // Verify register values
  const regs = await page.evaluate(() => {
    const primary = document.querySelectorAll('.primary-registers .register-value');
    const special = document.querySelectorAll('.special-registers .register-value');
    const flags = document.querySelectorAll('.flag-registers .register-value');
    return {
      A: primary[0]?.textContent.trim(),
      B: primary[1]?.textContent.trim(),
      C: primary[2]?.textContent.trim(),
      D: primary[3]?.textContent.trim(),
      E: primary[4]?.textContent.trim(),
      H: primary[5]?.textContent.trim(),
      L: primary[6]?.textContent.trim(),
      PC: special[0]?.textContent.trim(),
      S: flags[5]?.textContent.trim(),
      Z: flags[6]?.textContent.trim(),
      AC: flags[7]?.textContent.trim(),
      P: flags[8]?.textContent.trim(),
      CY: flags[9]?.textContent.trim(),
    };
  });

  console.log('Final registers:', JSON.stringify(regs, null, 2));

  // After 10 iterations: A = 0A+09+08+07+06+05+04+03+02+01 = 55 = 0x37
  expect(regs.A).toBe('37');
  expect(regs.C).toBe('00');
  // Z flag should be 1 (C decremented to 0)
  expect(regs.Z).toBe('1');
  // CY should be 0
  expect(regs.CY).toBe('0');
});

test('Step through all iterations: highlight never lands on MVI A 00 after first pass', async ({ page }) => {
  await page.goto('http://localhost:5050');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.locator('text=Assemble').click();
  await page.waitForTimeout(500);

  const stepForwardBtn = page.locator('.navigation-button').nth(2);

  // Step through MVI C 0A (step 1) and MVI A 00 (step 2)
  await stepForwardBtn.click();
  await page.waitForTimeout(100);
  await stepForwardBtn.click();
  await page.waitForTimeout(100);

  // Now step through the rest - MVI A 00 should never be highlighted again
  // 10 iterations * 3 instructions (ADD C, DCR C, JNZ LOOP) + STA + HLT = 32 steps
  for (let step = 3; step <= 35; step++) {
    await stepForwardBtn.click();
    await page.waitForTimeout(100);

    const highlightText = await page.evaluate(() => {
      const row = document.querySelector('.assembled-row.coloured');
      return row ? row.textContent.trim() : null;
    });

    if (highlightText === null) break; // execution done

    console.log(`Step ${step}: "${highlightText}"`);
    // After the initial MVI A 00 execution, highlight should NEVER return to MVI A 00
    expect(highlightText).not.toContain('MVI A 00');
  }
});
