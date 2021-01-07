import { instructionSet } from "./instructions";

// contains mnemonic -> number of bytes
var numBytes = {};

// contains mnemonic -> opcode
var opcode = {};

Object.entries(instructionSet.instruciontSet).forEach(([key, value]) => {
    numBytes[key] = value.numBytes;
    opcode[key] = value.opcode;
});

export { numBytes, opcode };
