// Polyfill for String.prototype.count used by execute.js
String.prototype.count = function (s1) {
    return (
        (this.length - this.replace(new RegExp(s1, "g"), "").length) / s1.length
    );
};

// We need to import execute. Since it uses ES module export, we use require after
// transforming with babel (react-scripts test handles this).
const { execute } = require("../execute");

// ─── Test helper ───────────────────────────────────────────────────────────────

function makeMemory() {
    return new Array(4096).fill(0).map(() => new Array(16).fill("00"));
}

function makeInput({ instructions, regs = {}, flags = {}, memory = null, steps = 1000 }) {
    const defaultRegs = {
        A: "00", B: "00", C: "00", D: "00", E: "00", H: "00", L: "00", M: "00",
        PC: "0000", SP: "0000",
    };
    const defaultFlags = { S: "0", Z: "0", AC: "0", P: "0", CY: "0" };

    const mem = memory || makeMemory();
    const mergedRegs = { ...defaultRegs, ...regs };
    const mergedFlags = { ...defaultFlags, ...flags };

    return {
        instructions,
        "primary-registers": mergedRegs,
        "flag-registers": mergedFlags,
        memory: mem,
        steps,
    };
}

function setMem(mem, addr, value) {
    const row = Math.floor(addr / 16);
    const col = addr % 16;
    mem[row][col] = value;
}

function getMem(mem, addr) {
    const row = Math.floor(addr / 16);
    const col = addr % 16;
    return mem[row][col];
}

// ─── 1. Data Movement ─────────────────────────────────────────────────────────

describe("Data Movement", () => {
    test("MOV A,B copies B into A", () => {
        // MOV A,B = 78, HLT = 76
        const result = execute(makeInput({
            instructions: [["78"], ["76"]],
            regs: { B: "42" },
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("MOV A,M reads from memory at HL", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "AB");
        const result = execute(makeInput({
            instructions: [["7E"], ["76"]],
            regs: { H: "50", L: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("AB");
    });

    test("MOV M,A writes A to memory at HL", () => {
        const result = execute(makeInput({
            instructions: [["77"], ["76"]],
            regs: { A: "FF", H: "50", L: "00" },
        }));
        expect(getMem(result.memory, 0x5000)).toBe("FF");
    });

    test("MVI A,42 loads immediate into A", () => {
        const result = execute(makeInput({
            instructions: [["3E", "42"], ["76"]],
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("MVI M,55 writes immediate to memory at HL", () => {
        const result = execute(makeInput({
            instructions: [["36", "55"], ["76"]],
            regs: { H: "50", L: "00" },
        }));
        expect(getMem(result.memory, 0x5000)).toBe("55");
    });

    test("LXI H,5000 loads H=50 L=00", () => {
        // LXI H = 21, byte3=00 byte2=50  (little-endian: low byte first in instruction)
        const result = execute(makeInput({
            instructions: [["21", "00", "50"], ["76"]],
        }));
        expect(result.primaryRegisters.H).toBe("50");
        expect(result.primaryRegisters.L).toBe("00");
    });

    test("LXI SP,FFFE sets SP", () => {
        const result = execute(makeInput({
            instructions: [["31", "FE", "FF"], ["76"]],
        }));
        expect(result.primaryRegisters.SP).toBe("FFFE");
    });

    test("LDA loads from memory address", () => {
        const mem = makeMemory();
        setMem(mem, 0x5100, "99");
        const result = execute(makeInput({
            instructions: [["3A", "00", "51"], ["76"]],
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("99");
    });

    test("STA stores A to memory address", () => {
        const result = execute(makeInput({
            instructions: [["32", "00", "51"], ["76"]],
            regs: { A: "AB" },
        }));
        expect(getMem(result.memory, 0x5100)).toBe("AB");
    });

    test("LDAX B loads from address in BC", () => {
        const mem = makeMemory();
        setMem(mem, 0x3000, "77");
        const result = execute(makeInput({
            instructions: [["0A"], ["76"]],
            regs: { B: "30", C: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("77");
    });

    test("STAX D stores A to address in DE", () => {
        const result = execute(makeInput({
            instructions: [["12"], ["76"]],
            regs: { A: "CC", D: "40", E: "00" },
        }));
        expect(getMem(result.memory, 0x4000)).toBe("CC");
    });

    test("LHLD loads HL from memory", () => {
        const mem = makeMemory();
        setMem(mem, 0x2000, "34"); // L
        setMem(mem, 0x2001, "12"); // H
        const result = execute(makeInput({
            instructions: [["2A", "00", "20"], ["76"]],
            memory: mem,
        }));
        expect(result.primaryRegisters.L).toBe("34");
        expect(result.primaryRegisters.H).toBe("12");
    });

    test("SHLD stores HL to memory", () => {
        const result = execute(makeInput({
            instructions: [["22", "00", "20"], ["76"]],
            regs: { H: "12", L: "34" },
        }));
        expect(getMem(result.memory, 0x2000)).toBe("34");
        expect(getMem(result.memory, 0x2001)).toBe("12");
    });

    test("XCHG swaps HL and DE", () => {
        const result = execute(makeInput({
            instructions: [["EB"], ["76"]],
            regs: { H: "11", L: "22", D: "33", E: "44" },
        }));
        expect(result.primaryRegisters.H).toBe("33");
        expect(result.primaryRegisters.L).toBe("44");
        expect(result.primaryRegisters.D).toBe("11");
        expect(result.primaryRegisters.E).toBe("22");
    });

    test("MOV A,M reads correct value after LXI H and STA to HL address", () => {
        // This tests Bug 1: M register must be synced from memory
        // LXI H 5000, MVI A 42, STA 5000, MVI A 00, MOV A M, HLT
        const result = execute(makeInput({
            instructions: [
                ["21", "00", "50"], // LXI H,5000
                ["3E", "42"],       // MVI A,42
                ["32", "00", "50"], // STA 5000
                ["3E", "00"],       // MVI A,00
                ["7E"],             // MOV A,M  (should read 42 from memory[5000])
                ["76"],             // HLT
            ],
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });
});

// ─── 2. Arithmetic ─────────────────────────────────────────────────────────────

describe("Arithmetic", () => {
    test("ADD B adds B to A", () => {
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "10", B: "20" },
        }));
        expect(result.primaryRegisters.A).toBe("30");
    });

    test("ADD B with overflow sets carry", () => {
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "FF", B: "01" },
        }));
        expect(result.primaryRegisters.A).toBe("00");
        expect(result.flagRegisters.CY).toBe("1");
        expect(result.flagRegisters.Z).toBe("1");
    });

    test("ADD M reads from memory at HL", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "05");
        const result = execute(makeInput({
            instructions: [["86"], ["76"]],
            regs: { A: "03", H: "50", L: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("08");
    });

    test("ADC with carry set", () => {
        const result = execute(makeInput({
            instructions: [["88"], ["76"]],
            regs: { A: "10", B: "20" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("31");
    });

    test("ADI adds immediate to A", () => {
        const result = execute(makeInput({
            instructions: [["C6", "05"], ["76"]],
            regs: { A: "0A" },
        }));
        expect(result.primaryRegisters.A).toBe("0F");
    });

    test("ACI adds immediate with carry", () => {
        const result = execute(makeInput({
            instructions: [["CE", "05"], ["76"]],
            regs: { A: "0A" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("10");
    });

    test("SUB B subtracts B from A", () => {
        const result = execute(makeInput({
            instructions: [["90"], ["76"]],
            regs: { A: "30", B: "10" },
        }));
        expect(result.primaryRegisters.A).toBe("20");
        expect(result.flagRegisters.CY).toBe("0");
    });

    test("SUB B with borrow sets carry", () => {
        const result = execute(makeInput({
            instructions: [["90"], ["76"]],
            regs: { A: "10", B: "20" },
        }));
        expect(result.primaryRegisters.A).toBe("F0");
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("SUB M reads from memory at HL", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "03");
        const result = execute(makeInput({
            instructions: [["96"], ["76"]],
            regs: { A: "08", H: "50", L: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("05");
    });

    test("SBB with borrow", () => {
        const result = execute(makeInput({
            instructions: [["98"], ["76"]],
            regs: { A: "30", B: "10" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("1F");
    });

    test("SUI subtracts immediate", () => {
        const result = execute(makeInput({
            instructions: [["D6", "05"], ["76"]],
            regs: { A: "0F" },
        }));
        expect(result.primaryRegisters.A).toBe("0A");
    });

    test("SBI subtracts immediate with borrow", () => {
        const result = execute(makeInput({
            instructions: [["DE", "05"], ["76"]],
            regs: { A: "10" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("0A");
    });

    test("INR B increments B, preserves carry", () => {
        const result = execute(makeInput({
            instructions: [["04"], ["76"]],
            regs: { B: "0F" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.B).toBe("10");
        expect(result.flagRegisters.CY).toBe("1"); // preserved
        expect(result.flagRegisters.AC).toBe("1"); // lower nibble overflow
    });

    test("DCR B decrements B, preserves carry", () => {
        const result = execute(makeInput({
            instructions: [["05"], ["76"]],
            regs: { B: "10" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.B).toBe("0F");
        expect(result.flagRegisters.CY).toBe("1"); // preserved
        expect(result.flagRegisters.AC).toBe("1"); // lower nibble borrow
    });

    test("INR M increments memory at HL", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "0A");
        const result = execute(makeInput({
            instructions: [["34"], ["76"]],
            regs: { H: "50", L: "00" },
            memory: mem,
        }));
        expect(getMem(result.memory, 0x5000)).toBe("0B");
    });

    test("DCR M decrements memory at HL", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "0A");
        const result = execute(makeInput({
            instructions: [["35"], ["76"]],
            regs: { H: "50", L: "00" },
            memory: mem,
        }));
        expect(getMem(result.memory, 0x5000)).toBe("09");
    });

    test("INX H increments HL pair", () => {
        const result = execute(makeInput({
            instructions: [["23"], ["76"]],
            regs: { H: "50", L: "FF" },
        }));
        expect(result.primaryRegisters.H).toBe("51");
        expect(result.primaryRegisters.L).toBe("00");
    });

    test("DCX H decrements HL pair", () => {
        const result = execute(makeInput({
            instructions: [["2B"], ["76"]],
            regs: { H: "51", L: "00" },
        }));
        expect(result.primaryRegisters.H).toBe("50");
        expect(result.primaryRegisters.L).toBe("FF");
    });

    test("DAD B adds BC to HL", () => {
        const result = execute(makeInput({
            instructions: [["09"], ["76"]],
            regs: { H: "10", L: "00", B: "20", C: "00" },
        }));
        expect(result.primaryRegisters.H).toBe("30");
        expect(result.primaryRegisters.L).toBe("00");
    });

    test("DAD with carry", () => {
        const result = execute(makeInput({
            instructions: [["09"], ["76"]],
            regs: { H: "FF", L: "00", B: "01", C: "00" },
        }));
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("DAA decimal adjust", () => {
        // 0x09 + 0x01 = 0x0A, DAA should correct to 0x10
        const result = execute(makeInput({
            instructions: [
                ["C6", "01"], // ADI 01 (A = 0A)
                ["27"],       // DAA
                ["76"],
            ],
            regs: { A: "09" },
        }));
        expect(result.primaryRegisters.A).toBe("10");
    });
});

// ─── 3. Flag Verification ──────────────────────────────────────────────────────

describe("Flag Verification", () => {
    test("Zero flag set when result is 0", () => {
        const result = execute(makeInput({
            instructions: [["90"], ["76"]],
            regs: { A: "05", B: "05" },
        }));
        expect(result.flagRegisters.Z).toBe("1");
    });

    test("Sign flag set when bit 7 is set", () => {
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "7F", B: "01" },
        }));
        expect(result.primaryRegisters.A).toBe("80");
        expect(result.flagRegisters.S).toBe("1");
    });

    test("Carry flag set on ADD overflow", () => {
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "80", B: "80" },
        }));
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("Carry flag set on SUB borrow", () => {
        const result = execute(makeInput({
            instructions: [["90"], ["76"]],
            regs: { A: "00", B: "01" },
        }));
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("Auxiliary carry on lower nibble carry", () => {
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "0F", B: "01" },
        }));
        expect(result.flagRegisters.AC).toBe("1");
    });

    test("Auxiliary carry on lower nibble borrow (SUB)", () => {
        const result = execute(makeInput({
            instructions: [["90"], ["76"]],
            regs: { A: "10", B: "01" },
        }));
        expect(result.flagRegisters.AC).toBe("1");
    });

    test("Parity flag - even parity", () => {
        // 0xFF = 11111111, 8 ones = even parity
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "FE", B: "01" },
        }));
        expect(result.primaryRegisters.A).toBe("FF");
        expect(result.flagRegisters.P).toBe("1"); // even parity
    });

    test("Parity flag - odd parity", () => {
        // 0x01 = 00000001, 1 one = odd parity
        const result = execute(makeInput({
            instructions: [["80"], ["76"]],
            regs: { A: "00", B: "01" },
        }));
        expect(result.primaryRegisters.A).toBe("01");
        expect(result.flagRegisters.P).toBe("0"); // odd parity
    });

    test("ANA clears CY, sets AC", () => {
        const result = execute(makeInput({
            instructions: [["A0"], ["76"]],
            regs: { A: "FF", B: "0F" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("0F");
        expect(result.flagRegisters.CY).toBe("0");
        expect(result.flagRegisters.AC).toBe("1");
    });

    test("ORA clears CY and AC", () => {
        const result = execute(makeInput({
            instructions: [["B0"], ["76"]],
            regs: { A: "F0", B: "0F" },
            flags: { CY: "1", AC: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("FF");
        expect(result.flagRegisters.CY).toBe("0");
        expect(result.flagRegisters.AC).toBe("0");
    });

    test("XRA clears CY and AC", () => {
        const result = execute(makeInput({
            instructions: [["A8"], ["76"]],
            regs: { A: "FF", B: "0F" },
            flags: { CY: "1", AC: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("F0");
        expect(result.flagRegisters.CY).toBe("0");
        expect(result.flagRegisters.AC).toBe("0");
    });

    test("CMP sets flags without changing A", () => {
        const result = execute(makeInput({
            instructions: [["B8"], ["76"]],
            regs: { A: "05", B: "05" },
        }));
        expect(result.primaryRegisters.A).toBe("05");
        expect(result.flagRegisters.Z).toBe("1");
    });

    test("CMP sets carry when A < reg", () => {
        const result = execute(makeInput({
            instructions: [["B8"], ["76"]],
            regs: { A: "03", B: "05" },
        }));
        expect(result.primaryRegisters.A).toBe("03");
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("CPI sets flags without changing A", () => {
        const result = execute(makeInput({
            instructions: [["FE", "05"], ["76"]],
            regs: { A: "05" },
        }));
        expect(result.primaryRegisters.A).toBe("05");
        expect(result.flagRegisters.Z).toBe("1");
    });

    test("STC sets carry flag", () => {
        const result = execute(makeInput({
            instructions: [["37"], ["76"]],
        }));
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("CMC complements carry flag", () => {
        const result = execute(makeInput({
            instructions: [["3F"], ["76"]],
            flags: { CY: "1" },
        }));
        expect(result.flagRegisters.CY).toBe("0");
    });
});

// ─── 4. Logical Operations ─────────────────────────────────────────────────────

describe("Logical Operations", () => {
    test("ANA B", () => {
        const result = execute(makeInput({
            instructions: [["A0"], ["76"]],
            regs: { A: "F0", B: "0F" },
        }));
        expect(result.primaryRegisters.A).toBe("00");
        expect(result.flagRegisters.Z).toBe("1");
    });

    test("ANI immediate", () => {
        const result = execute(makeInput({
            instructions: [["E6", "0F"], ["76"]],
            regs: { A: "AB" },
        }));
        expect(result.primaryRegisters.A).toBe("0B");
        expect(result.flagRegisters.CY).toBe("0");
        expect(result.flagRegisters.AC).toBe("1");
    });

    test("ORA B", () => {
        const result = execute(makeInput({
            instructions: [["B0"], ["76"]],
            regs: { A: "F0", B: "0F" },
        }));
        expect(result.primaryRegisters.A).toBe("FF");
    });

    test("ORI immediate", () => {
        const result = execute(makeInput({
            instructions: [["F6", "0F"], ["76"]],
            regs: { A: "F0" },
        }));
        expect(result.primaryRegisters.A).toBe("FF");
        expect(result.flagRegisters.CY).toBe("0");
        expect(result.flagRegisters.AC).toBe("0");
    });

    test("XRA A clears A", () => {
        const result = execute(makeInput({
            instructions: [["AF"], ["76"]],
            regs: { A: "FF" },
        }));
        expect(result.primaryRegisters.A).toBe("00");
        expect(result.flagRegisters.Z).toBe("1");
    });

    test("XRI immediate", () => {
        const result = execute(makeInput({
            instructions: [["EE", "FF"], ["76"]],
            regs: { A: "AA" },
        }));
        expect(result.primaryRegisters.A).toBe("55");
        expect(result.flagRegisters.CY).toBe("0");
        expect(result.flagRegisters.AC).toBe("0");
    });

    test("CMA complements A", () => {
        const result = execute(makeInput({
            instructions: [["2F"], ["76"]],
            regs: { A: "55" },
        }));
        expect(result.primaryRegisters.A).toBe("AA");
    });

    test("ANA M reads from memory", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "0F");
        const result = execute(makeInput({
            instructions: [["A6"], ["76"]],
            regs: { A: "FF", H: "50", L: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("0F");
    });

    test("ORA M reads from memory", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "0F");
        const result = execute(makeInput({
            instructions: [["B6"], ["76"]],
            regs: { A: "F0", H: "50", L: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("FF");
    });

    test("XRA M reads from memory", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "FF");
        const result = execute(makeInput({
            instructions: [["AE"], ["76"]],
            regs: { A: "AA", H: "50", L: "00" },
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("55");
    });
});

// ─── 5. Rotate ─────────────────────────────────────────────────────────────────

describe("Rotate", () => {
    test("RLC rotates left through bit 7", () => {
        const result = execute(makeInput({
            instructions: [["07"], ["76"]],
            regs: { A: "80" }, // 10000000
        }));
        expect(result.primaryRegisters.A).toBe("01");
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("RRC rotates right through bit 0", () => {
        const result = execute(makeInput({
            instructions: [["0F"], ["76"]],
            regs: { A: "01" }, // 00000001
        }));
        expect(result.primaryRegisters.A).toBe("80");
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("RAL rotates left through carry", () => {
        const result = execute(makeInput({
            instructions: [["17"], ["76"]],
            regs: { A: "80" },
            flags: { CY: "0" },
        }));
        expect(result.primaryRegisters.A).toBe("00");
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("RAR rotates right through carry", () => {
        const result = execute(makeInput({
            instructions: [["1F"], ["76"]],
            regs: { A: "01" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("80");
        expect(result.flagRegisters.CY).toBe("1");
    });
});

// ─── 6. Branch/Control Flow ────────────────────────────────────────────────────

describe("Branch/Control Flow", () => {
    test("JMP jumps to address", () => {
        // JMP 0004, NOP, NOP, MVI A 42, HLT
        // addr 0000: C3 04 00  (JMP 0004)
        // addr 0003: 00        (NOP - skipped)
        // addr 0004: 3E 42     (MVI A,42)
        // addr 0006: 76        (HLT)
        const result = execute(makeInput({
            instructions: [["C3", "04", "00"], ["00"], ["3E", "42"], ["76"]],
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("JZ jumps when Z=1", () => {
        const result = execute(makeInput({
            instructions: [["CA", "03", "00"], ["3E", "FF"], ["76"]],
            flags: { Z: "1" },
        }));
        // JZ should jump to 0003 which is 3E (MVI A FF) - skipping it would land at 76
        // addr 0000: CA 03 00  (JZ 0003)  -> jumps to 0003
        // addr 0003: 3E FF     (MVI A,FF) -> not at 0003... let me recalculate
        // Instructions: [["CA","03","00"], ["3E","FF"], ["76"]]
        // addr 0000: CA 03 00  -> 3 bytes
        // addr 0003: 3E FF     -> 2 bytes
        // addr 0005: 76        -> 1 byte
        // JZ 0003 with Z=1: jumps to addr 0003 -> MVI A FF
        expect(result.primaryRegisters.A).toBe("FF");
    });

    test("JNZ does not jump when Z=1", () => {
        const result = execute(makeInput({
            instructions: [["C2", "05", "00"], ["3E", "42"], ["76"]],
            flags: { Z: "1" },
        }));
        // JNZ 0005, but Z=1, so falls through to MVI A 42
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("JC jumps when CY=1", () => {
        const result = execute(makeInput({
            instructions: [["DA", "03", "00"], ["76"], ["3E", "99"], ["76"]],
            flags: { CY: "1" },
        }));
        // addr 0000: DA 03 00  -> JC 0003 (jumps since CY=1)
        // addr 0003: 76        -> HLT (but that's the first HLT)
        // Wait, let me recalculate:
        // [["DA","03","00"], ["76"], ["3E","99"], ["76"]]
        // addr 0000: DA 03 00  (3 bytes)
        // addr 0003: 76        (1 byte)  -> HLT
        // addr 0004: 3E 99     (2 bytes)
        // addr 0006: 76        (1 byte)
        // JC 0003 jumps to 0003 which is HLT. A stays 00.
        expect(result.primaryRegisters.A).toBe("00");
    });

    test("JNC does not jump when CY=1", () => {
        const result = execute(makeInput({
            instructions: [["D2", "05", "00"], ["3E", "42"], ["76"]],
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("JP jumps when S=0 (positive)", () => {
        const result = execute(makeInput({
            instructions: [["F2", "03", "00"], ["76"], ["3E", "42"], ["76"]],
            flags: { S: "0" },
        }));
        // addr 0: F2 03 00 -> JP 0003, S=0 so jumps
        // addr 3: 76 -> HLT
        expect(result.primaryRegisters.A).toBe("00");
    });

    test("JM jumps when S=1", () => {
        const result = execute(makeInput({
            instructions: [["FA", "03", "00"], ["76"], ["3E", "42"], ["76"]],
            flags: { S: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("00");
    });

    test("CALL/RET saves and restores PC", () => {
        // CALL 0006, MVI A 99, HLT, MVI B 42, RET
        // addr 0000: CD 06 00  (CALL 0006)
        // addr 0003: 3E 99     (MVI A,99)  <- return here
        // addr 0005: 76        (HLT)
        // addr 0006: 06 42     (MVI B,42)
        // addr 0008: C9        (RET)
        const result = execute(makeInput({
            instructions: [
                ["CD", "06", "00"],
                ["3E", "99"],
                ["76"],
                ["06", "42"],
                ["C9"],
            ],
            regs: { SP: "FFFE" },
        }));
        expect(result.primaryRegisters.B).toBe("42");
        expect(result.primaryRegisters.A).toBe("99");
    });

    test("CC calls when CY=1", () => {
        const result = execute(makeInput({
            instructions: [
                ["DC", "06", "00"], // CC 0006
                ["3E", "99"],       // MVI A,99
                ["76"],             // HLT
                ["06", "42"],       // MVI B,42
                ["C9"],             // RET
            ],
            regs: { SP: "FFFE" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.B).toBe("42");
        expect(result.primaryRegisters.A).toBe("99");
    });

    test("CNC does not call when CY=1", () => {
        const result = execute(makeInput({
            instructions: [
                ["D4", "06", "00"], // CNC 0006
                ["3E", "99"],       // MVI A,99
                ["76"],             // HLT
                ["06", "42"],       // MVI B,42
                ["C9"],             // RET
            ],
            regs: { SP: "FFFE" },
            flags: { CY: "1" },
        }));
        expect(result.primaryRegisters.B).toBe("00"); // never called
        expect(result.primaryRegisters.A).toBe("99");
    });

    test("RZ returns when Z=1", () => {
        // Set up: CALL a subroutine that does RZ
        // The subroutine sets B=42, then does RZ (Z should be set from XRA A)
        const result = execute(makeInput({
            instructions: [
                ["AF"],             // XRA A (A=0, Z=1)
                ["CD", "07", "00"], // CALL 0007
                ["3E", "99"],       // MVI A,99
                ["76"],             // HLT
                ["06", "42"],       // MVI B,42
                ["C8"],             // RZ (returns since Z=1 from XRA A)
            ],
            regs: { SP: "FFFE" },
        }));
        expect(result.primaryRegisters.B).toBe("42");
        expect(result.primaryRegisters.A).toBe("99");
    });

    test("RST 0 pushes PC and jumps to 0x0000", () => {
        // RST 0 at addr 0005
        // addr 0000: 3E 42 76 00 00 C7
        // That's messy, let's set up simpler:
        // addr 0000: C7  (RST 0) -> pushes 0001, jumps to 0000, infinite loop
        // Better test: verify SP changes and PC
        const result = execute(makeInput({
            instructions: [["C7"], ["76"]],
            regs: { SP: "FFFE" },
            steps: 1, // just execute one step
        }));
        expect(result.primaryRegisters.PC).toBe("0000"); // vector 0
        expect(result.primaryRegisters.SP).toBe("FFFC"); // SP decremented by 2
    });

    test("PCHL jumps to HL", () => {
        // PCHL at addr 0000, then MVI A,42 at addr where HL points
        // addr 0000: E9      (PCHL) -> jumps to HL
        // addr 0001: 76      (HLT - skipped if HL != 0001)
        // addr 0002: 3E 42   (MVI A,42)
        // addr 0004: 76      (HLT)
        const result = execute(makeInput({
            instructions: [["E9"], ["76"], ["3E", "42"], ["76"]],
            regs: { H: "00", L: "02" },
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("Conditional returns - RNZ does not return when Z=1", () => {
        const result = execute(makeInput({
            instructions: [
                ["AF"],             // XRA A (Z=1)
                ["CD", "07", "00"], // CALL 0007
                ["3E", "99"],       // MVI A,99
                ["76"],             // HLT
                ["06", "42"],       // MVI B,42
                ["C0"],             // RNZ (does NOT return since Z=1)
                ["06", "FF"],       // MVI B,FF
                ["C9"],             // RET
            ],
            regs: { SP: "FFFE" },
        }));
        expect(result.primaryRegisters.B).toBe("FF");
    });
});

// ─── 7. Stack Operations ───────────────────────────────────────────────────────

describe("Stack Operations", () => {
    test("PUSH B / POP B roundtrip", () => {
        const result = execute(makeInput({
            instructions: [
                ["C5"],             // PUSH B
                ["06", "00"],       // MVI B,00
                ["0E", "00"],       // MVI C,00
                ["C1"],             // POP B
                ["76"],
            ],
            regs: { B: "12", C: "34", SP: "FFFE" },
        }));
        expect(result.primaryRegisters.B).toBe("12");
        expect(result.primaryRegisters.C).toBe("34");
    });

    test("PUSH D / POP D roundtrip", () => {
        const result = execute(makeInput({
            instructions: [["D5"], ["16", "00"], ["1E", "00"], ["D1"], ["76"]],
            regs: { D: "AB", E: "CD", SP: "FFFE" },
        }));
        expect(result.primaryRegisters.D).toBe("AB");
        expect(result.primaryRegisters.E).toBe("CD");
    });

    test("PUSH H / POP H roundtrip", () => {
        const result = execute(makeInput({
            instructions: [["E5"], ["26", "00"], ["2E", "00"], ["E1"], ["76"]],
            regs: { H: "11", L: "22", SP: "FFFE" },
        }));
        expect(result.primaryRegisters.H).toBe("11");
        expect(result.primaryRegisters.L).toBe("22");
    });

    test("PUSH PSW / POP PSW roundtrip preserves flags", () => {
        const result = execute(makeInput({
            instructions: [
                ["F5"],             // PUSH PSW
                ["AF"],             // XRA A (clears A and changes flags)
                ["F1"],             // POP PSW
                ["76"],
            ],
            regs: { A: "42", SP: "FFFE" },
            flags: { S: "1", Z: "0", AC: "1", P: "0", CY: "1" },
        }));
        expect(result.primaryRegisters.A).toBe("42");
        expect(result.flagRegisters.S).toBe("1");
        expect(result.flagRegisters.Z).toBe("0");
        expect(result.flagRegisters.AC).toBe("1");
        expect(result.flagRegisters.P).toBe("0");
        expect(result.flagRegisters.CY).toBe("1");
    });

    test("PUSH B stores high byte at SP-1, low byte at SP-2", () => {
        const result = execute(makeInput({
            instructions: [["C5"], ["76"]],
            regs: { B: "12", C: "34", SP: "FFFE" },
        }));
        // SP-1 = 0xFFFD should have B (high byte = 12)
        // SP-2 = 0xFFFC should have C (low byte = 34)
        expect(getMem(result.memory, 0xFFFD)).toBe("12");
        expect(getMem(result.memory, 0xFFFC)).toBe("34");
        expect(result.primaryRegisters.SP).toBe("FFFC");
    });

    test("CALL stores PCH at SP-1, PCL at SP-2", () => {
        // CALL at addr 0000, next instruction addr = 0003
        const result = execute(makeInput({
            instructions: [
                ["CD", "03", "00"], // CALL 0003
                ["76"],             // HLT at 0003
            ],
            regs: { SP: "FFFE" },
        }));
        // Return address is 0003 -> PCH=00, PCL=03
        expect(getMem(result.memory, 0xFFFD)).toBe("00"); // high byte
        expect(getMem(result.memory, 0xFFFC)).toBe("03"); // low byte
    });

    test("SPHL sets SP to HL", () => {
        const result = execute(makeInput({
            instructions: [["F9"], ["76"]],
            regs: { H: "FF", L: "FE" },
        }));
        expect(result.primaryRegisters.SP).toBe("FFFE");
    });

    test("XTHL exchanges HL with stack top", () => {
        const mem = makeMemory();
        // Stack at FFFC: low byte at FFFC, high byte at FFFD
        setMem(mem, 0xFFFC, "34"); // low byte (will go to L)
        setMem(mem, 0xFFFD, "12"); // high byte (will go to H)
        const result = execute(makeInput({
            instructions: [["E3"], ["76"]],
            regs: { H: "AB", L: "CD", SP: "FFFC" },
            memory: mem,
        }));
        expect(result.primaryRegisters.H).toBe("12");
        expect(result.primaryRegisters.L).toBe("34");
        expect(getMem(result.memory, 0xFFFC)).toBe("CD");
        expect(getMem(result.memory, 0xFFFD)).toBe("AB");
    });
});

// ─── 8. Full Program Tests ─────────────────────────────────────────────────────

describe("Full Programs", () => {
    test("Multiply 3 x 4 = 12", () => {
        // Multiply: A = multiplicand (3), B = multiplier (4), result in C
        // MVI A,03; MVI B,04; MVI C,00; LOOP: ADD C [wait, need to accumulate]
        // Better approach: C = 0, loop: C = C + A, DCR B, JNZ LOOP
        // But we can't easily use labels. Let's use raw opcodes.
        // MVI A,03   -> 3E 03
        // MVI B,04   -> 06 04
        // MVI C,00   -> 0E 00
        // LOOP (addr 0006):
        //   MOV D,A  -> 57       (save A)
        //   MOV A,C  -> 79       (A = C)
        //   ADD D    -> 82       (A = C + multiplicand)
        //   MOV C,A  -> 4F       (C = result)
        //   MOV A,D  -> 7A       (restore A)
        //   DCR B    -> 05       (B--)
        //   JNZ 0006 -> C2 06 00
        //   MOV A,C  -> 79
        //   HLT      -> 76
        const result = execute(makeInput({
            instructions: [
                ["3E", "03"],       // MVI A,03
                ["06", "04"],       // MVI B,04
                ["0E", "00"],       // MVI C,00
                // LOOP at addr 0006:
                ["57"],             // MOV D,A
                ["79"],             // MOV A,C
                ["82"],             // ADD D
                ["4F"],             // MOV C,A
                ["7A"],             // MOV A,D
                ["05"],             // DCR B
                ["C2", "06", "00"], // JNZ LOOP
                ["79"],             // MOV A,C
                ["76"],             // HLT
            ],
        }));
        expect(result.primaryRegisters.A).toBe("0C"); // 12 = 0x0C
    });

    test("Sum of array [1,2,3,4,5] = 15", () => {
        // Load array at memory 5000: 01 02 03 04 05
        // LXI H,5000; MVI C,05; MVI A,00; LOOP: ADD M; INX H; DCR C; JNZ LOOP; HLT
        const mem = makeMemory();
        setMem(mem, 0x5000, "01");
        setMem(mem, 0x5001, "02");
        setMem(mem, 0x5002, "03");
        setMem(mem, 0x5003, "04");
        setMem(mem, 0x5004, "05");

        const result = execute(makeInput({
            instructions: [
                ["21", "00", "50"], // LXI H,5000
                ["0E", "05"],       // MVI C,05
                ["3E", "00"],       // MVI A,00
                // LOOP at addr 0007:
                ["86"],             // ADD M
                ["23"],             // INX H
                ["0D"],             // DCR C
                ["C2", "07", "00"], // JNZ LOOP
                ["76"],             // HLT
            ],
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("0F"); // 15 = 0x0F
    });

    test("Fibonacci: first 6 numbers", () => {
        // prev=D, curr=E, next computed in A, count=C
        // addr 0000: LXI H,5000   (3 bytes)
        // addr 0003: MVI D,00     (2 bytes)
        // addr 0005: MVI E,01     (2 bytes)
        // addr 0007: MVI C,06     (2 bytes)
        // LOOP at addr 0009:
        // addr 0009: MOV M,E      (1 byte)
        // addr 000A: MOV A,E      (1 byte)
        // addr 000B: ADD D        (1 byte)
        // addr 000C: MOV D,E      (1 byte)
        // addr 000D: MOV E,A      (1 byte)
        // addr 000E: INX H        (1 byte)
        // addr 000F: DCR C        (1 byte)
        // addr 0010: JNZ 0009     (3 bytes)
        // addr 0013: HLT          (1 byte)
        const result = execute(makeInput({
            instructions: [
                ["21", "00", "50"], // LXI H,5000
                ["16", "00"],       // MVI D,00 (prev)
                ["1E", "01"],       // MVI E,01 (curr)
                ["0E", "06"],       // MVI C,06 (count)
                // LOOP at addr 0009:
                ["73"],             // MOV M,E  (store curr at [HL])
                ["7B"],             // MOV A,E  (A = curr)
                ["82"],             // ADD D    (A = curr + prev)
                ["53"],             // MOV D,E  (prev = old curr)
                ["5F"],             // MOV E,A  (curr = next)
                ["23"],             // INX H
                ["0D"],             // DCR C
                ["C2", "09", "00"], // JNZ LOOP
                ["76"],             // HLT
            ],
        }));
        expect(getMem(result.memory, 0x5000)).toBe("01");
        expect(getMem(result.memory, 0x5001)).toBe("01");
        expect(getMem(result.memory, 0x5002)).toBe("02");
        expect(getMem(result.memory, 0x5003)).toBe("03");
        expect(getMem(result.memory, 0x5004)).toBe("05");
        expect(getMem(result.memory, 0x5005)).toBe("08");
    });

    test("Count set bits in 0xAA (10101010) = 4", () => {
        // A = input (AA), B = count = 0
        // Loop 8 times: rotate A right, if CY set increment B
        // addr 0000: MVI A,AA  (2 bytes)
        // addr 0002: MVI B,00  (2 bytes)
        // addr 0004: MVI C,08  (2 bytes)
        // LOOP at addr 0006:
        // addr 0006: RRC       (1 byte)
        // addr 0007: JNC SKIP  (3 bytes) -> SKIP at 000B
        // addr 000A: INR B     (1 byte)
        // SKIP at addr 000B:
        // addr 000B: DCR C     (1 byte)
        // addr 000C: JNZ LOOP  (3 bytes) -> LOOP at 0006
        // addr 000F: HLT       (1 byte)
        const result = execute(makeInput({
            instructions: [
                ["3E", "AA"],       // MVI A,AA (10101010)
                ["06", "00"],       // MVI B,00 (bit count)
                ["0E", "08"],       // MVI C,08 (loop count)
                // LOOP at addr 0006:
                ["0F"],             // RRC
                ["D2", "0B", "00"], // JNC SKIP (addr 000B)
                ["04"],             // INR B
                // SKIP at addr 000B:
                ["0D"],             // DCR C
                ["C2", "06", "00"], // JNZ LOOP
                ["76"],             // HLT
            ],
        }));
        expect(result.primaryRegisters.B).toBe("04");
    });

    test("Bubble sort [5,3,1,4,2] -> [1,2,3,4,5]", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "05");
        setMem(mem, 0x5001, "03");
        setMem(mem, 0x5002, "01");
        setMem(mem, 0x5003, "04");
        setMem(mem, 0x5004, "02");
        // n=5, need n-1=4 passes, each pass compares adjacent pairs
        // Outer loop: D = 4 (passes)
        // OUTER (addr 0004):
        //   LXI H,5000; MVI C,04 (comparisons per pass = 4, simplified)
        //   INNER (addr 0009):
        //     MOV A,M; INX H; CMP M; JC NOSWAP (no swap if A < [HL+1])
        //     MOV B,M; MOV M,A; DCX H; MOV M,B; INX H
        //   NOSWAP: DCR C; JNZ INNER
        //   DCR D; JNZ OUTER
        //   HLT

        const result = execute(makeInput({
            instructions: [
                ["16", "04"],       // MVI D,04 (outer passes)
                // OUTER at addr 0002:
                ["21", "00", "50"], // LXI H,5000
                ["0E", "04"],       // MVI C,04 (inner comparisons)
                // INNER at addr 0007:
                ["7E"],             // MOV A,M
                ["23"],             // INX H
                ["BE"],             // CMP M
                ["DA", "15", "00"], // JC NOSWAP (addr 0015)
                ["CA", "15", "00"], // JZ NOSWAP (addr 0015) - equal means no swap
                ["46"],             // MOV B,M (B = [HL+1])
                ["77"],             // MOV M,A (write A to [HL+1])
                ["2B"],             // DCX H
                ["70"],             // MOV M,B (write B to [HL])
                ["23"],             // INX H
                // NOSWAP at addr 0015:
                ["0D"],             // DCR C
                ["C2", "07", "00"], // JNZ INNER
                ["15"],             // DCR D
                ["C2", "02", "00"], // JNZ OUTER
                ["76"],             // HLT
            ],
            memory: mem,
        }));
        expect(getMem(result.memory, 0x5000)).toBe("01");
        expect(getMem(result.memory, 0x5001)).toBe("02");
        expect(getMem(result.memory, 0x5002)).toBe("03");
        expect(getMem(result.memory, 0x5003)).toBe("04");
        expect(getMem(result.memory, 0x5004)).toBe("05");
    });
});

// ─── 9. Memory Initialization (Bug 2) ─────────────────────────────────────────

describe("Memory Initialization", () => {
    test("Uninitialized memory is string '00', not number 0", () => {
        const mem = makeMemory();
        expect(typeof mem[0][0]).toBe("string");
        expect(mem[0][0]).toBe("00");
    });

    test("LDA from uninitialized memory returns '00' string", () => {
        const result = execute(makeInput({
            instructions: [["3A", "00", "50"], ["76"]],
        }));
        expect(result.primaryRegisters.A).toBe("00");
        expect(typeof result.primaryRegisters.A).toBe("string");
    });
});

// ─── 10. M Register Sync (Bug 1) ──────────────────────────────────────────────

describe("M Register Sync", () => {
    test("MOV A,M after STA to HL address reads correct value", () => {
        const result = execute(makeInput({
            instructions: [
                ["21", "00", "50"], // LXI H,5000
                ["3E", "42"],       // MVI A,42
                ["32", "00", "50"], // STA 5000
                ["3E", "00"],       // MVI A,00
                ["7E"],             // MOV A,M
                ["76"],
            ],
        }));
        expect(result.primaryRegisters.A).toBe("42");
    });

    test("ADD M after STAX to HL address reads correct value", () => {
        const mem = makeMemory();
        const result = execute(makeInput({
            instructions: [
                ["21", "00", "50"], // LXI H,5000
                ["3E", "05"],       // MVI A,05
                ["01", "00", "50"], // LXI B,5000
                ["02"],             // STAX B (stores A=05 to [BC]=5000)
                ["3E", "03"],       // MVI A,03
                ["86"],             // ADD M (should read 05 from memory[5000])
                ["76"],
            ],
            memory: mem,
        }));
        expect(result.primaryRegisters.A).toBe("08"); // 03 + 05
    });

    test("CMP M after INX H reads from new HL address", () => {
        const mem = makeMemory();
        setMem(mem, 0x5000, "01");
        setMem(mem, 0x5001, "02");
        const result = execute(makeInput({
            instructions: [
                ["21", "00", "50"], // LXI H,5000
                ["23"],             // INX H (HL = 5001)
                ["3E", "02"],       // MVI A,02
                ["BE"],             // CMP M (compare A with [5001]=02)
                ["76"],
            ],
            memory: mem,
        }));
        expect(result.flagRegisters.Z).toBe("1"); // equal
    });
});
