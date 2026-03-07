String.prototype.count = function (s1) {
    return (
        (this.length - this.replace(new RegExp(s1, "g"), "").length) / s1.length
    );
};


function setInstructionAddress(instructions) {
    let offset = 0;
    let startAddress = parseInt("0000", 16);
    let instructionAddress = {};

    for (let i = 0; i < instructions.length; i++) {
        let curAddress = (startAddress + offset)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0");
        instructionAddress[curAddress] = instructions[i];
        offset += instructions[i].length;
    }

    return instructionAddress;
}


function execute(jsonInput) {
    let instructions = jsonInput["instructions"];
    instructions = setInstructionAddress(instructions);
    let genReg = jsonInput["primary-registers"];
    let flagReg = jsonInput["flag-registers"];
    let memory = jsonInput["memory"];
    let steps = jsonInput["steps"];

    for (let x = 0; x < steps; x++) {
        const currentInstruction = instructions[genReg["PC"]];
        if (!currentInstruction || currentInstruction[0] === "76") break;
        let ret = instruction_def(currentInstruction, genReg, flagReg, memory);
        genReg = ret["primaryRegisters"];
        flagReg = ret["flagRegisters"];
        memory = ret["memory"];
    }

    return {
        primaryRegisters: genReg,
        flagRegisters: flagReg,
        memory: memory,
    };
}


function getMemoryIndex(address) {
    return [parseInt(address / 16), parseInt(address % 16)];
}


function setFlagReg(acc, flagReg) {
    let bin = (acc >>> 0).toString(2).padStart(8, "0").slice(-8);

    flagReg["S"]  = bin[0] === "1" ? "1" : "0";
    flagReg["Z"]  = bin.count("1") === 0 ? "1" : "0";
    flagReg["P"]  = bin.count("1") % 2 === 0 ? "1" : "0";
    flagReg["CY"] = (acc >>> 0).toString(2).padStart(9, "0").slice(-9)[0] === "1" ? "1" : "0";

    return flagReg;
}


function adc(reg, genReg, flagReg) {
    let aVal = parseInt(genReg["A"], 16);
    let operandVal = parseInt(genReg[reg], 16);
    let carry = parseInt(flagReg["CY"]);
    let result = aVal + operandVal + carry;
    flagReg = setFlagReg(result, flagReg);
    flagReg["AC"] = ((aVal & 0xF) + (operandVal & 0xF) + carry) > 0xF ? "1" : "0";
    genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    return [genReg, flagReg];
}


function add(reg, genReg, flagReg) {
    let aVal = parseInt(genReg["A"], 16);
    let operandVal = parseInt(genReg[reg], 16);
    let result = aVal + operandVal;
    flagReg = setFlagReg(result, flagReg);
    flagReg["AC"] = ((aVal & 0xF) + (operandVal & 0xF)) > 0xF ? "1" : "0";
    genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    return [genReg, flagReg];
}


function ana(reg, genReg, flagReg) {
    let result = parseInt(genReg["A"], 16) & parseInt(genReg[reg], 16);
    flagReg = setFlagReg(result, flagReg);
    flagReg["CY"] = "0";
    flagReg["AC"] = "1";
    genReg["A"] = result.toString(16).toUpperCase().padStart(2, "0").slice(-2);
    return [genReg, flagReg];
}


function call(byte2, byte3, genReg, memory, isCall) {
    let pc = parseInt(genReg["PC"], 16) + 3;
    let nextPC = pc.toString(16).toUpperCase().padStart(4, "0").slice(-4);

    if (isCall) {
        let tempAdd = parseInt(genReg["SP"], 16);
        tempAdd--;
        let idx = getMemoryIndex(tempAdd);
        memory[idx[0]][idx[1]] = nextPC.slice(0, 2); // high byte at SP-1
        tempAdd--;
        idx = getMemoryIndex(tempAdd);
        memory[idx[0]][idx[1]] = nextPC.slice(-2);   // low byte at SP-2
        genReg["SP"] = tempAdd.toString(16).toUpperCase().padStart(4, "0").slice(-4);
        genReg["PC"] = byte2 + byte3;
    } else {
        genReg["PC"] = nextPC;
    }

    return [genReg, memory];
}


function cmp(reg, genReg, flagReg) {
    let aVal = parseInt(genReg["A"], 16);
    let operandVal = parseInt(genReg[reg], 16);
    let result = aVal - operandVal;
    flagReg = setFlagReg(result, flagReg);
    flagReg["AC"] = ((aVal & 0xF) - (operandVal & 0xF)) < 0 ? "1" : "0";
    return flagReg;
}


function dad(reg, genReg, flagReg) {
    let lowByte  = parseInt(genReg["L"], 16);
    let highByte = parseInt(genReg["H"], 16);
    let regLow, regHigh;

    if (reg === "B")       { regHigh = parseInt(genReg["B"], 16); regLow = parseInt(genReg["C"], 16); }
    else if (reg === "D")  { regHigh = parseInt(genReg["D"], 16); regLow = parseInt(genReg["E"], 16); }
    else if (reg === "H")  { regHigh = parseInt(genReg["H"], 16); regLow = parseInt(genReg["L"], 16); }
    else if (reg === "SP") { regHigh = parseInt(genReg["SP"].slice(0, 2), 16); regLow = parseInt(genReg["SP"].slice(2), 16); }

    lowByte  += regLow;
    highByte += regHigh;
    if (lowByte >= 256) highByte++;

    flagReg["CY"] = highByte >= 256 ? "1" : "0";

    genReg["L"] = (lowByte  & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    genReg["H"] = (highByte & 0xFF).toString(16).toUpperCase().padStart(2, "0");

    return [genReg, flagReg];
}


function dcr(reg, genReg, flagReg) {
    let regVal = parseInt(genReg[reg], 16);
    flagReg["AC"] = (regVal & 0xF) === 0x0 ? "1" : "0";
    let result = regVal - 1;
    let savedCY = flagReg["CY"];
    flagReg = setFlagReg(result, flagReg);
    flagReg["CY"] = savedCY; // DCR does not affect carry
    genReg[reg] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    return [genReg, flagReg];
}


function dcx(reg, genReg) {
    let operand;
    if      (reg === "B")  operand = genReg["B"] + genReg["C"];
    else if (reg === "D")  operand = genReg["D"] + genReg["E"];
    else if (reg === "H")  operand = genReg["H"] + genReg["L"];
    else if (reg === "SP") operand = genReg["SP"];

    operand = ((parseInt(operand, 16) - 1) & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");

    if      (reg === "B")  { genReg["B"] = operand.slice(0, 2); genReg["C"] = operand.slice(2); }
    else if (reg === "D")  { genReg["D"] = operand.slice(0, 2); genReg["E"] = operand.slice(2); }
    else if (reg === "H")  { genReg["H"] = operand.slice(0, 2); genReg["L"] = operand.slice(2); }
    else if (reg === "SP") { genReg["SP"] = operand; }

    return genReg;
}


function inr(reg, genReg, flagReg) {
    let regVal = parseInt(genReg[reg], 16);
    flagReg["AC"] = (regVal & 0xF) === 0xF ? "1" : "0";
    let result = regVal + 1;
    let savedCY = flagReg["CY"];
    flagReg = setFlagReg(result, flagReg);
    flagReg["CY"] = savedCY; // INR does not affect carry
    genReg[reg] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    return [genReg, flagReg];
}


function inx(reg, genReg) {
    let operand;
    if      (reg === "B")  operand = genReg["B"] + genReg["C"];
    else if (reg === "D")  operand = genReg["D"] + genReg["E"];
    else if (reg === "H")  operand = genReg["H"] + genReg["L"];
    else if (reg === "SP") operand = genReg["SP"];

    operand = ((parseInt(operand, 16) + 1) & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");

    if      (reg === "B")  { genReg["B"] = operand.slice(0, 2); genReg["C"] = operand.slice(2); }
    else if (reg === "D")  { genReg["D"] = operand.slice(0, 2); genReg["E"] = operand.slice(2); }
    else if (reg === "H")  { genReg["H"] = operand.slice(0, 2); genReg["L"] = operand.slice(2); }
    else if (reg === "SP") { genReg["SP"] = operand; }

    return genReg;
}


function lxi(reg, byte3, byte2, genReg) {
    if      (reg === "B")  { genReg["B"] = byte2; genReg["C"] = byte3; }
    else if (reg === "D")  { genReg["D"] = byte2; genReg["E"] = byte3; }
    else if (reg === "H")  { genReg["H"] = byte2; genReg["L"] = byte3; }
    else if (reg === "SP") { genReg["SP"] = byte2 + byte3; }
    return genReg;
}


function ldax(reg, genReg, memory) {
    let tempAdd = reg === "B"
        ? genReg["B"] + genReg["C"]
        : genReg["D"] + genReg["E"];
    let idx = getMemoryIndex(parseInt(tempAdd, 16));
    genReg["A"] = memory[idx[0]][idx[1]];
    return genReg;
}


function ora(reg, genReg, flagReg) {
    let result = parseInt(genReg["A"], 16) | parseInt(genReg[reg], 16);
    flagReg = setFlagReg(result, flagReg);
    flagReg["CY"] = "0";
    flagReg["AC"] = "0";
    genReg["A"] = result.toString(16).toUpperCase().padStart(2, "0").slice(-2);
    return [genReg, flagReg];
}


function sbb(reg, genReg, flagReg) {
    let aVal = parseInt(genReg["A"], 16);
    let operandVal = parseInt(genReg[reg], 16);
    let borrow = parseInt(flagReg["CY"]);
    let result = aVal - operandVal - borrow;
    flagReg = setFlagReg(result, flagReg);
    flagReg["AC"] = ((aVal & 0xF) - (operandVal & 0xF) - borrow) < 0 ? "1" : "0";
    genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    return [genReg, flagReg];
}


function stax(reg, genReg, memory) {
    let tempAdd = reg === "B"
        ? genReg["B"] + genReg["C"]
        : genReg["D"] + genReg["E"];
    let idx = getMemoryIndex(parseInt(tempAdd, 16));
    memory[idx[0]][idx[1]] = genReg["A"];
    return memory;
}


function sub(reg, genReg, flagReg) {
    let aVal = parseInt(genReg["A"], 16);
    let operandVal = parseInt(genReg[reg], 16);
    let result = aVal - operandVal;
    flagReg = setFlagReg(result, flagReg);
    flagReg["AC"] = ((aVal & 0xF) - (operandVal & 0xF)) < 0 ? "1" : "0";
    genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
    return [genReg, flagReg];
}


function xra(reg, genReg, flagReg) {
    let result = parseInt(genReg["A"], 16) ^ parseInt(genReg[reg], 16);
    flagReg = setFlagReg(result, flagReg);
    flagReg["CY"] = "0";
    flagReg["AC"] = "0";
    genReg["A"] = result.toString(16).toUpperCase().padStart(2, "0").slice(-2);
    return [genReg, flagReg];
}


function push_regs(highReg, lowReg, genReg, memory) {
    let sp = parseInt(genReg["SP"], 16);
    sp--;
    let idx = getMemoryIndex(sp);
    memory[idx[0]][idx[1]] = genReg[highReg];  // high byte at SP-1
    sp--;
    idx = getMemoryIndex(sp);
    memory[idx[0]][idx[1]] = genReg[lowReg];   // low byte at SP-2
    genReg["SP"] = sp.toString(16).toUpperCase().padStart(4, "0").slice(-4);
    return [genReg, memory];
}


function pop_regs(highReg, lowReg, genReg, memory) {
    let sp = parseInt(genReg["SP"], 16);
    let idx = getMemoryIndex(sp);
    genReg[lowReg] = memory[idx[0]][idx[1]];    // low byte at SP
    idx = getMemoryIndex(sp + 1);
    genReg[highReg] = memory[idx[0]][idx[1]];   // high byte at SP+1
    sp += 2;
    genReg["SP"] = sp.toString(16).toUpperCase().padStart(4, "0").slice(-4);
    return genReg;
}


function ret_helper(genReg, memory) {
    let sp = parseInt(genReg["SP"], 16);
    let idx = getMemoryIndex(sp);
    let lowByte = memory[idx[0]][idx[1]];
    idx = getMemoryIndex(sp + 1);
    let highByte = memory[idx[0]][idx[1]];
    sp += 2;
    genReg["SP"] = sp.toString(16).toUpperCase().padStart(4, "0").slice(-4);
    genReg["PC"] = highByte + lowByte;
    return genReg;
}


function ret_cond(condition, genReg, memory) {
    if (condition) {
        genReg = ret_helper(genReg, memory);
    } else {
        let pc = parseInt(genReg["PC"], 16) + 1;
        genReg["PC"] = pc.toString(16).toUpperCase().padStart(4, "0");
    }
    return genReg;
}


function rst(vector, genReg, memory) {
    let pc = (parseInt(genReg["PC"], 16) + 1).toString(16).toUpperCase().padStart(4, "0").slice(-4);
    let sp = parseInt(genReg["SP"], 16);
    sp--;
    let idx = getMemoryIndex(sp);
    memory[idx[0]][idx[1]] = pc.slice(0, 2); // high byte at SP-1
    sp--;
    idx = getMemoryIndex(sp);
    memory[idx[0]][idx[1]] = pc.slice(-2);   // low byte at SP-2
    genReg["SP"] = sp.toString(16).toUpperCase().padStart(4, "0").slice(-4);
    genReg["PC"] = (vector * 8).toString(16).toUpperCase().padStart(4, "0");
    return [genReg, memory];
}


function flagsToByte(flagReg) {
    let b = 0x02; // bit 1 always set per 8085 spec
    if (flagReg["S"]  === "1") b |= 0x80;
    if (flagReg["Z"]  === "1") b |= 0x40;
    if (flagReg["AC"] === "1") b |= 0x10;
    if (flagReg["P"]  === "1") b |= 0x04;
    if (flagReg["CY"] === "1") b |= 0x01;
    return b.toString(16).toUpperCase().padStart(2, "0");
}


function byteToFlags(byteVal, flagReg) {
    let val = parseInt(byteVal, 16);
    flagReg["S"]  = (val & 0x80) ? "1" : "0";
    flagReg["Z"]  = (val & 0x40) ? "1" : "0";
    flagReg["AC"] = (val & 0x10) ? "1" : "0";
    flagReg["P"]  = (val & 0x04) ? "1" : "0";
    flagReg["CY"] = (val & 0x01) ? "1" : "0";
    return flagReg;
}


function instruction_def(instruction, genReg, flagReg, memory) {
    let tempAdd, memoryIndex, reg, byte2, byte3, pc, numBytes;
    let opcode = instruction[0];

    // Sync M register from actual memory at HL
    let hlAddr = parseInt(genReg["H"] + genReg["L"], 16);
    let hlIdx = getMemoryIndex(hlAddr);
    genReg["M"] = typeof memory[hlIdx[0]][hlIdx[1]] === 'number'
        ? memory[hlIdx[0]][hlIdx[1]].toString(16).toUpperCase().padStart(2, "0")
        : memory[hlIdx[0]][hlIdx[1]];

    switch (opcode) {

        ///////////////////////////////////////////////////////////////////////////////////
        // ACI
        case "CE": {
            byte2 = parseInt(instruction[1], 16);
            let aVal = parseInt(genReg["A"], 16);
            let carry = parseInt(flagReg["CY"]);
            reg = aVal + byte2 + carry;
            flagReg = setFlagReg(reg, flagReg);
            flagReg["AC"] = ((aVal & 0xF) + (byte2 & 0xF) + carry) > 0xF ? "1" : "0";
            genReg["A"] = (reg & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // ADC
        case "8F": reg = adc("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "88": reg = adc("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "89": reg = adc("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "8A": reg = adc("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "8B": reg = adc("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "8C": reg = adc("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "8D": reg = adc("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "8E": reg = adc("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // ADD
        case "87": reg = add("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "80": reg = add("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "81": reg = add("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "82": reg = add("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "83": reg = add("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "84": reg = add("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "85": reg = add("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "86": reg = add("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // ADI
        case "C6": {
            byte2 = parseInt(instruction[1], 16);
            let aVal = parseInt(genReg["A"], 16);
            reg = aVal + byte2;
            flagReg = setFlagReg(reg, flagReg);
            flagReg["AC"] = ((aVal & 0xF) + (byte2 & 0xF)) > 0xF ? "1" : "0";
            genReg["A"] = (reg & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // ANA
        case "A7": reg = ana("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A0": reg = ana("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A1": reg = ana("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A2": reg = ana("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A3": reg = ana("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A4": reg = ana("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A5": reg = ana("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A6": reg = ana("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // ANI
        case "E6":
            byte2 = parseInt(instruction[1], 16);
            reg = parseInt(genReg["A"], 16) & byte2;
            flagReg = setFlagReg(reg, flagReg);
            flagReg["CY"] = "0";
            flagReg["AC"] = "1";
            genReg["A"] = (reg & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CALL
        case "CD":
            reg = call(instruction[2], instruction[1], genReg, memory, true);
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CC
        case "DC":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["CY"] === "1");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CM
        case "FC":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["S"] === "1");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CMA
        case "2F":
            genReg["A"] = ((~parseInt(genReg["A"], 16)) & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CMC
        case "3F":
            flagReg["CY"] = flagReg["CY"] === "0" ? "1" : "0";
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CMP
        case "BF": flagReg = cmp("A", genReg, flagReg); numBytes = 1; break;
        case "B8": flagReg = cmp("B", genReg, flagReg); numBytes = 1; break;
        case "B9": flagReg = cmp("C", genReg, flagReg); numBytes = 1; break;
        case "BA": flagReg = cmp("D", genReg, flagReg); numBytes = 1; break;
        case "BB": flagReg = cmp("E", genReg, flagReg); numBytes = 1; break;
        case "BC": flagReg = cmp("H", genReg, flagReg); numBytes = 1; break;
        case "BD": flagReg = cmp("L", genReg, flagReg); numBytes = 1; break;
        case "BE": flagReg = cmp("M", genReg, flagReg); numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CNC
        case "D4":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["CY"] === "0");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CNZ
        case "C4":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["Z"] === "0");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CP
        case "F4":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["S"] === "0");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CPE
        case "EC":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["P"] === "1");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CPI
        case "FE": {
            byte2 = parseInt(instruction[1], 16);
            let aVal = parseInt(genReg["A"], 16);
            reg = aVal - byte2;
            flagReg = setFlagReg(reg, flagReg);
            flagReg["AC"] = ((aVal & 0xF) - (byte2 & 0xF)) < 0 ? "1" : "0";
            numBytes = 2;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // CPO
        case "E4":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["P"] === "0");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // CZ
        case "CC":
            reg = call(instruction[2], instruction[1], genReg, memory, flagReg["Z"] === "1");
            genReg = reg[0]; memory = reg[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // DAA
        case "27": {
            let acc = parseInt(genReg["A"], 16);
            let correction = 0;
            let newCY = flagReg["CY"] === "1" ? 1 : 0;
            if ((acc & 0x0F) > 9 || flagReg["AC"] === "1") correction |= 0x06;
            if (acc > 0x99 || flagReg["CY"] === "1") { correction |= 0x60; newCY = 1; }
            acc += correction;
            flagReg = setFlagReg(acc, flagReg);
            flagReg["CY"] = newCY.toString();
            genReg["A"] = (acc & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // DAD
        case "09": reg = dad("B",  genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "19": reg = dad("D",  genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "29": reg = dad("H",  genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "39": reg = dad("SP", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // DCR
        case "3D": reg = dcr("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "05": reg = dcr("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "0D": reg = dcr("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "15": reg = dcr("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "1D": reg = dcr("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "25": reg = dcr("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "2D": reg = dcr("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "35":
            reg = dcr("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1];
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["M"];
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // DCX
        case "0B": genReg = dcx("B",  genReg); numBytes = 1; break;
        case "1B": genReg = dcx("D",  genReg); numBytes = 1; break;
        case "2B": genReg = dcx("H",  genReg); numBytes = 1; break;
        case "3B": genReg = dcx("SP", genReg); numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // DI
        case "F3":
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // EI
        case "FB":
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // HLT
        case "76":
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // IN
        case "DB":
            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // INR
        case "3C": reg = inr("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "04": reg = inr("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "0C": reg = inr("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "14": reg = inr("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "1C": reg = inr("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "24": reg = inr("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "2C": reg = inr("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "34":
            reg = inr("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1];
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["M"];
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // INX
        case "03": genReg = inx("B",  genReg); numBytes = 1; break;
        case "13": genReg = inx("D",  genReg); numBytes = 1; break;
        case "23": genReg = inx("H",  genReg); numBytes = 1; break;
        case "33": genReg = inx("SP", genReg); numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JC
        case "DA":
            if (flagReg["CY"] === "1") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JM
        case "FA":
            if (flagReg["S"] === "1") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JMP
        case "C3":
            genReg["PC"] = instruction[2] + instruction[1];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JNC
        case "D2":
            if (flagReg["CY"] === "0") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JNZ
        case "C2":
            if (flagReg["Z"] === "0") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JP
        case "F2":
            if (flagReg["S"] === "0") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JPE
        case "EA":
            if (flagReg["P"] === "1") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JPO
        case "E2":
            if (flagReg["P"] === "0") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // JZ
        case "CA":
            if (flagReg["Z"] === "1") {
                genReg["PC"] = instruction[2] + instruction[1];
            } else {
                genReg["PC"] = (parseInt(genReg["PC"], 16) + 3).toString(16).toUpperCase().padStart(4, "0");
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // LDA
        case "3A":
            tempAdd = parseInt(instruction[2] + instruction[1], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["A"] = memory[memoryIndex[0]][memoryIndex[1]];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // LDAX
        case "0A": genReg = ldax("B", genReg, memory); numBytes = 1; break;
        case "1A": genReg = ldax("D", genReg, memory); numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // LHLD
        case "2A":
            tempAdd = parseInt(instruction[2] + instruction[1], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["L"] = memory[memoryIndex[0]][memoryIndex[1]];
            memoryIndex = getMemoryIndex(tempAdd + 1);
            genReg["H"] = memory[memoryIndex[0]][memoryIndex[1]];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // LXI
        case "01": genReg = lxi("B",  instruction[1], instruction[2], genReg); numBytes = 3; break;
        case "11": genReg = lxi("D",  instruction[1], instruction[2], genReg); numBytes = 3; break;
        case "21": genReg = lxi("H",  instruction[1], instruction[2], genReg); numBytes = 3; break;
        case "31": genReg = lxi("SP", instruction[1], instruction[2], genReg); numBytes = 3; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV A,x
        case "7F": numBytes = 1; break;
        case "78": genReg["A"] = genReg["B"]; numBytes = 1; break;
        case "79": genReg["A"] = genReg["C"]; numBytes = 1; break;
        case "7A": genReg["A"] = genReg["D"]; numBytes = 1; break;
        case "7B": genReg["A"] = genReg["E"]; numBytes = 1; break;
        case "7C": genReg["A"] = genReg["H"]; numBytes = 1; break;
        case "7D": genReg["A"] = genReg["L"]; numBytes = 1; break;
        case "7E": genReg["A"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV B,x
        case "47": genReg["B"] = genReg["A"]; numBytes = 1; break;
        case "40": numBytes = 1; break;
        case "41": genReg["B"] = genReg["C"]; numBytes = 1; break;
        case "42": genReg["B"] = genReg["D"]; numBytes = 1; break;
        case "43": genReg["B"] = genReg["E"]; numBytes = 1; break;
        case "44": genReg["B"] = genReg["H"]; numBytes = 1; break;
        case "45": genReg["B"] = genReg["L"]; numBytes = 1; break;
        case "46": genReg["B"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV C,x
        case "4F": genReg["C"] = genReg["A"]; numBytes = 1; break;
        case "48": genReg["C"] = genReg["B"]; numBytes = 1; break;
        case "49": numBytes = 1; break;
        case "4A": genReg["C"] = genReg["D"]; numBytes = 1; break;
        case "4B": genReg["C"] = genReg["E"]; numBytes = 1; break;
        case "4C": genReg["C"] = genReg["H"]; numBytes = 1; break;
        case "4D": genReg["C"] = genReg["L"]; numBytes = 1; break;
        case "4E": genReg["C"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV D,x
        case "57": genReg["D"] = genReg["A"]; numBytes = 1; break;
        case "50": genReg["D"] = genReg["B"]; numBytes = 1; break;
        case "51": genReg["D"] = genReg["C"]; numBytes = 1; break;
        case "52": numBytes = 1; break;
        case "53": genReg["D"] = genReg["E"]; numBytes = 1; break;
        case "54": genReg["D"] = genReg["H"]; numBytes = 1; break;
        case "55": genReg["D"] = genReg["L"]; numBytes = 1; break;
        case "56": genReg["D"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV E,x
        case "5F": genReg["E"] = genReg["A"]; numBytes = 1; break;
        case "58": genReg["E"] = genReg["B"]; numBytes = 1; break;
        case "59": genReg["E"] = genReg["C"]; numBytes = 1; break;
        case "5A": genReg["E"] = genReg["D"]; numBytes = 1; break;
        case "5B": numBytes = 1; break;
        case "5C": genReg["E"] = genReg["H"]; numBytes = 1; break;
        case "5D": genReg["E"] = genReg["L"]; numBytes = 1; break;
        case "5E": genReg["E"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV H,x
        case "67": genReg["H"] = genReg["A"]; numBytes = 1; break;
        case "60": genReg["H"] = genReg["B"]; numBytes = 1; break;
        case "61": genReg["H"] = genReg["C"]; numBytes = 1; break;
        case "62": genReg["H"] = genReg["D"]; numBytes = 1; break;
        case "63": genReg["H"] = genReg["E"]; numBytes = 1; break;
        case "64": numBytes = 1; break;
        case "65": genReg["H"] = genReg["L"]; numBytes = 1; break;
        case "66": genReg["H"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV L,x
        case "6F": genReg["L"] = genReg["A"]; numBytes = 1; break;
        case "68": genReg["L"] = genReg["B"]; numBytes = 1; break;
        case "69": genReg["L"] = genReg["C"]; numBytes = 1; break;
        case "6A": genReg["L"] = genReg["D"]; numBytes = 1; break;
        case "6B": genReg["L"] = genReg["E"]; numBytes = 1; break;
        case "6C": genReg["L"] = genReg["H"]; numBytes = 1; break;
        case "6D": numBytes = 1; break;
        case "6E": genReg["L"] = genReg["M"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MOV M,x  (writes to both virtual M register and memory[H][L])
        case "77":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["A"]; genReg["M"] = genReg["A"]; numBytes = 1; break;
        case "70":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["B"]; genReg["M"] = genReg["B"]; numBytes = 1; break;
        case "71":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["C"]; genReg["M"] = genReg["C"]; numBytes = 1; break;
        case "72":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["D"]; genReg["M"] = genReg["D"]; numBytes = 1; break;
        case "73":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["E"]; genReg["M"] = genReg["E"]; numBytes = 1; break;
        case "74":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["H"]; genReg["M"] = genReg["H"]; numBytes = 1; break;
        case "75":
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16); memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["L"]; genReg["M"] = genReg["L"]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // MVI
        case "3E": genReg["A"] = instruction[1]; numBytes = 2; break;
        case "06": genReg["B"] = instruction[1]; numBytes = 2; break;
        case "0E": genReg["C"] = instruction[1]; numBytes = 2; break;
        case "16": genReg["D"] = instruction[1]; numBytes = 2; break;
        case "1E": genReg["E"] = instruction[1]; numBytes = 2; break;
        case "26": genReg["H"] = instruction[1]; numBytes = 2; break;
        case "2E": genReg["L"] = instruction[1]; numBytes = 2; break;
        case "36":
            genReg["M"] = instruction[1];
            tempAdd = parseInt(genReg["H"] + genReg["L"], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = instruction[1];
            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // NOP
        case "00":
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // ORA
        case "B7": reg = ora("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B0": reg = ora("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B1": reg = ora("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B2": reg = ora("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B3": reg = ora("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B4": reg = ora("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B5": reg = ora("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "B6": reg = ora("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // ORI
        case "F6":
            byte2 = parseInt(instruction[1], 16);
            reg = parseInt(genReg["A"], 16) | byte2;
            flagReg = setFlagReg(reg, flagReg);
            flagReg["CY"] = "0";
            flagReg["AC"] = "0";
            genReg["A"] = (reg & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // OUT
        case "D3":
            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // PCHL
        case "E9":
            genReg["PC"] = genReg["H"] + genReg["L"];
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // POP
        case "C1": genReg = pop_regs("B", "C", genReg, memory); numBytes = 1; break;
        case "D1": genReg = pop_regs("D", "E", genReg, memory); numBytes = 1; break;
        case "E1": genReg = pop_regs("H", "L", genReg, memory); numBytes = 1; break;
        case "F1": {
            let sp = parseInt(genReg["SP"], 16);
            let fIdx = getMemoryIndex(sp);
            let aIdx = getMemoryIndex(sp + 1);
            flagReg = byteToFlags(memory[fIdx[0]][fIdx[1]], flagReg);
            genReg["A"] = memory[aIdx[0]][aIdx[1]];
            genReg["SP"] = (sp + 2).toString(16).toUpperCase().padStart(4, "0").slice(-4);
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // PUSH
        case "C5": reg = push_regs("B", "C", genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "D5": reg = push_regs("D", "E", genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "E5": reg = push_regs("H", "L", genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "F5": {
            let sp = parseInt(genReg["SP"], 16);
            sp--;
            let aIdx = getMemoryIndex(sp);
            memory[aIdx[0]][aIdx[1]] = genReg["A"];            // A at SP-1
            sp--;
            let fIdx = getMemoryIndex(sp);
            memory[fIdx[0]][fIdx[1]] = flagsToByte(flagReg);  // flags at SP-2
            genReg["SP"] = sp.toString(16).toUpperCase().padStart(4, "0").slice(-4);
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // RAL
        case "17": {
            let a = parseInt(genReg["A"], 16);
            let cy = parseInt(flagReg["CY"]);
            let msb = (a & 0x80) >> 7;
            a = ((a << 1) | cy) & 0xFF;
            flagReg["CY"] = msb.toString();
            genReg["A"] = a.toString(16).toUpperCase().padStart(2, "0");
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // RAR
        case "1F": {
            let a = parseInt(genReg["A"], 16);
            let cy = parseInt(flagReg["CY"]);
            let lsb = a & 0x01;
            a = ((a >> 1) | (cy << 7)) & 0xFF;
            flagReg["CY"] = lsb.toString();
            genReg["A"] = a.toString(16).toUpperCase().padStart(2, "0");
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // RC
        case "D8":
            genReg = ret_cond(flagReg["CY"] === "1", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RET
        case "C9":
            genReg = ret_helper(genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RIM  (read interrupt mask - stub, no interrupt model)
        case "20":
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RLC
        case "07": {
            let a = parseInt(genReg["A"], 16);
            let msb = (a & 0x80) >> 7;
            a = ((a << 1) | msb) & 0xFF;
            flagReg["CY"] = msb.toString();
            genReg["A"] = a.toString(16).toUpperCase().padStart(2, "0");
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // RM
        case "F8":
            genReg = ret_cond(flagReg["S"] === "1", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RNC
        case "D0":
            genReg = ret_cond(flagReg["CY"] === "0", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RNZ
        case "C0":
            genReg = ret_cond(flagReg["Z"] === "0", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RP
        case "F0":
            genReg = ret_cond(flagReg["S"] === "0", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RPE
        case "E8":
            genReg = ret_cond(flagReg["P"] === "1", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RPO
        case "E0":
            genReg = ret_cond(flagReg["P"] === "0", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RRC
        case "0F": {
            let a = parseInt(genReg["A"], 16);
            let lsb = a & 0x01;
            a = ((a >> 1) | (lsb << 7)) & 0xFF;
            flagReg["CY"] = lsb.toString();
            genReg["A"] = a.toString(16).toUpperCase().padStart(2, "0");
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // RST 0-7
        case "C7": reg = rst(0, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "CF": reg = rst(1, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "D7": reg = rst(2, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "DF": reg = rst(3, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "E7": reg = rst(4, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "EF": reg = rst(5, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "F7": reg = rst(6, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;
        case "FF": reg = rst(7, genReg, memory); genReg = reg[0]; memory = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // RZ
        case "C8":
            genReg = ret_cond(flagReg["Z"] === "1", genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // SBB
        case "9F": reg = sbb("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "98": reg = sbb("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "99": reg = sbb("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "9A": reg = sbb("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "9B": reg = sbb("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "9C": reg = sbb("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "9D": reg = sbb("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "9E": reg = sbb("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // SBI
        case "DE": {
            byte2 = parseInt(instruction[1], 16);
            let aVal = parseInt(genReg["A"], 16);
            let borrow = parseInt(flagReg["CY"]);
            let result = aVal - byte2 - borrow;
            flagReg = setFlagReg(result, flagReg);
            flagReg["AC"] = ((aVal & 0xF) - (byte2 & 0xF) - borrow) < 0 ? "1" : "0";
            genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // SHLD
        case "22":
            tempAdd = parseInt(instruction[2] + instruction[1], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd + 1);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["H"];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // SIM  (set interrupt mask - stub, no interrupt model)
        case "30":
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // SPHL
        case "F9":
            genReg["SP"] = genReg["H"] + genReg["L"];
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // STA
        case "32":
            tempAdd = parseInt(instruction[2] + instruction[1], 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["A"];
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // STAX
        case "02": memory = stax("B", genReg, memory); numBytes = 1; break;
        case "12": memory = stax("D", genReg, memory); numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // STC
        case "37":
            flagReg["CY"] = "1";
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////
        // SUB
        case "97": reg = sub("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "90": reg = sub("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "91": reg = sub("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "92": reg = sub("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "93": reg = sub("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "94": reg = sub("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "95": reg = sub("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "96": reg = sub("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // SUI
        case "D6": {
            byte2 = parseInt(instruction[1], 16);
            let aVal = parseInt(genReg["A"], 16);
            let result = aVal - byte2;
            flagReg = setFlagReg(result, flagReg);
            flagReg["AC"] = ((aVal & 0xF) - (byte2 & 0xF)) < 0 ? "1" : "0";
            genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // XCHG
        case "EB": {
            let tmpH = genReg["H"], tmpL = genReg["L"];
            genReg["H"] = genReg["D"]; genReg["L"] = genReg["E"];
            genReg["D"] = tmpH;        genReg["E"] = tmpL;
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // XRA
        case "AF": reg = xra("A", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A8": reg = xra("B", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "A9": reg = xra("C", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "AA": reg = xra("D", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "AB": reg = xra("E", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "AC": reg = xra("H", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "AD": reg = xra("L", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;
        case "AE": reg = xra("M", genReg, flagReg); genReg = reg[0]; flagReg = reg[1]; numBytes = 1; break;

        ///////////////////////////////////////////////////////////////////////////////////
        // XRI
        case "EE": {
            byte2 = parseInt(instruction[1], 16);
            let result = parseInt(genReg["A"], 16) ^ byte2;
            flagReg = setFlagReg(result, flagReg);
            flagReg["CY"] = "0";
            flagReg["AC"] = "0";
            genReg["A"] = (result & 0xFF).toString(16).toUpperCase().padStart(2, "0");
            numBytes = 2;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // XTHL
        case "E3": {
            let sp = parseInt(genReg["SP"], 16);
            let idxLow  = getMemoryIndex(sp);
            let idxHigh = getMemoryIndex(sp + 1);
            let stackL = memory[idxLow[0]][idxLow[1]];
            let stackH = memory[idxHigh[0]][idxHigh[1]];
            memory[idxLow[0]][idxLow[1]]   = genReg["L"];
            memory[idxHigh[0]][idxHigh[1]] = genReg["H"];
            genReg["L"] = stackL;
            genReg["H"] = stackH;
            numBytes = 1;
            break;
        }

        ///////////////////////////////////////////////////////////////////////////////////
        default:
            console.log("Unknown opcode:", opcode);
            numBytes = 1;
    }

    // Instructions that manage their own PC are excluded from auto-advance
    const managesOwnPC = new Set([
        "DA","FA","C3","D2","C2","F2","EA","E2","CA", // jumps
        "CD","DC","FC","D4","C4","F4","EC","E4","CC", // calls
        "C9",                                          // RET
        "C0","C8","D0","D8","E0","E8","F0","F8",       // conditional returns
        "C7","CF","D7","DF","E7","EF","F7","FF",       // RST
        "E9",                                          // PCHL
    ]);

    if (!managesOwnPC.has(opcode)) {
        let pcVal = parseInt(genReg["PC"], 16) + numBytes;
        genReg["PC"] = pcVal.toString(16).toUpperCase().padStart(4, "0");
    }

    return {
        primaryRegisters: genReg,
        flagRegisters: flagReg,
        memory: memory,
    };
}

export { execute };
