// START:	LXI H,5000
// 	MOV A,M
// 	MOV B,A
// 	MVI C,09
// LOOP:	ADD B
// 	DCR C
// 	JNZ LOOP
// 	INX H
// 	ADD M
// 	STA 5100
// 	HLT

// [
//     [ '21', '00', '50' ],
//     [ '7E' ],
//     [ '47' ],
//     [ '0E', '09' ],
//     [ '80' ],
//     [ '0D' ],
//     [ 'C2', '07', '00' ],
//     [ '23' ],
//     [ '86' ],
//     [ '32', '00', '51' ],
//     [ '76' ]
//   ]

String.prototype.count = function (s1) {
    return (
        (this.length - this.replace(new RegExp(s1, "g"), "").length) / s1.length
    );
};


function setInstructionAddress(instructions){
    let offset = 0;
    let startAddress = "0000";
    startAddress = parseInt(startAddress, 16);
    let curAddress;
    let instructionAddress = {};

    for(let i=0; i<instructions.length; i++){
        curAddress = startAddress + offset;
        curAddress = curAddress.toString(16)
                        .toUpperCase()
                        .padStart(4, "0");
        instructionAddress[curAddress] = instructions[i];

        offset += instructions[i].length;
    }

    return instructionAddress;
}


function execute(jsonInput) {
    // Input
    // {
    //     instructions: [ (array opcodes returned from server) ]
    //     start-instruction: (index from where to start execution)
    //     steps: (number of instructions to process)
    //     primary-registers: {
    //         A: "00"
    //         B: "00"
    //         C: "00"
    //         ...
    //     }

    //     flag-registers: {
    //         S: "00"
    //         CY: "00"
    //         Z: "00"
    //         ...
    //     }

    //     memory: [
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         .... (4095 times)
    //     ]
    // }

    // output
    // {
    //     primary-registers: {
    //         A: "00"
    //         B: "00"
    //         C: "00"
    //         ...
    //     }

    //     flag-registers: {
    //         S: "00"
    //         CY: "00"
    //         Z: "00"
    //         ...
    //     }

    //     memory: [
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         [0, 0, 0, 0, ... (16 times)],
    //         .... (4095 times)
    //     ]
    // }

    let instructions = jsonInput["instructions"];
    instructions = setInstructionAddress(instructions);
    let start_index = jsonInput["start-instruction"];
    let steps = jsonInput["steps"];
    let genReg = jsonInput["primary-registers"];
    let flagReg = jsonInput["flag-registers"];
    let memory = jsonInput["memory"];
    

    // console.log(instructionAddress);

    // let idx = getMemoryIndex(parseInt("5100", 16));

    let ret;
    for (let x = 0; x < steps; x++) {
        // console.log(instructions[start_index + x]);
        ret = instruction_def(
            instructions[genReg["PC"]],
            genReg,
            flagReg,
            memory
        );
        genReg = ret["primaryRegisters"];
        flagReg = ret["flagRegisters"]
        memory = ret["memory"];

        
        // console.log(memory[idx[0]][idx[1]]);
        
        // console.log(genReg);
        // console.log(flagReg);
    }

    return {
        primaryRegisters: genReg,
        flagRegisters: flagReg,
        memory: memory,
    };
}

function getMemoryIndex(address) {
    let i = parseInt(address / 16);
    let j = parseInt(address % 16);

    return [i, j];
}

function setFlagReg(acc, flagReg) {
    let bin = acc;
    bin = (bin >>> 0).toString(2).padStart(8, "0").slice(-8);

    if (bin[0] === "1") {
        flagReg["S"] = "1";
    } else {
        flagReg["S"] = "0";
    }

    if (bin.count("1") === 0) {
        flagReg["Z"] = "1";
    } else {
        flagReg["Z"] = "0";
    }

    if (bin.count("1") % 2 === 0) {
        flagReg["P"] = "1";
    } else {
        flagReg["P"] = "0";
    }

    if ((acc >>> 0).toString(2).padStart(9, "0").slice(-9)[0] === "1") {
        flagReg["CY"] = "1";
    } else {
        flagReg["CY"] = "0";
    }

    return flagReg;
}

function adc(reg, genReg, flagReg) {
    let operand1 = genReg["A"];
    let operand2 = genReg[reg];
    let operand3 = flagReg["CY"];

    operand1 = parseInt(operand1, 16);
    operand2 = parseInt(operand2, 16);
    operand3 = parseInt(operand3, 16);

    operand1 += operand2 + operand3;
    flagReg = setFlagReg(operand1, flagReg);

    operand1 = operand1.toString(16).toUpperCase().padStart(2, "0").slice(-2);
    genReg["A"] = operand1;

    return [genReg, flagReg];
}

function add(reg, genReg, flagReg) {
    let operand1 = genReg["A"];
    operand1 = parseInt(operand1, 16);
    let operand2;

    operand2 = genReg[reg];
    operand2 = parseInt(operand2, 16);

    operand1 += operand2;

    flagReg = setFlagReg(operand1, flagReg);

    operand1 = operand1.toString(16).toUpperCase().padStart(2, "0").slice(-2);
    genReg["A"] = operand1;

    return [genReg, flagReg];
}

function ana(reg, genReg, flagReg) {
    let operand1 = genReg["A"];
    let operand2 = genReg[reg];

    operand1 = parseInt(operand1, 16);
    operand2 = parseInt(operand2, 16);

    operand1 = operand1 & operand2;
    flagReg = setFlagReg(operand1, flagReg);

    operand1 = operand1.toString(16).toUpperCase().padStart(2, "0").slice(-2);
    genReg["A"] = operand1;

    return [genReg, flagReg];
}


function call(byte2, byte3, genReg, memory, isCall){
    let pc = genReg["PC"];
    pc = parseInt(pc, 16);
    pc += 3;
    pc = pc.toString(16)
            .toUpperCase()
            .padStart(4, '0')
            .slice(-4);
    
    if(isCall){
        let tempAdd = genReg["SP"];
        tempAdd = parseInt(tempAdd, 16);
        tempAdd--;
        let memoryIndex = getMemoryIndex(tempAdd);
        memory[memoryIndex[0]][memoryIndex[1]] = pc.slice(-2);
        tempAdd--;
        memoryIndex = getMemoryIndex(tempAdd);
        memory[memoryIndex[0]][memoryIndex[1]] = pc.slice(0,2);

        tempAdd = tempAdd.toString(16)
                    .toUpperCase()
                    .padStart(4, '0')
                    .slice(-4);
        genReg["SP"] = tempAdd;

        pc = byte2 + byte3;
        genReg["PC"] = pc;
    }
    
    return [genReg, memory];
}


function cmp(reg, genReg, flagReg){
    let operand1 = genReg['A'];
    let operand2 = genReg[reg];
    operand1 = parseInt(operand1, 16);
    operand2 = parseInt(operand2, 16);
    operand1 = operand1 - operand2;
    flagReg = setFlagReg(operand1, flagReg);

    return flagReg;
}


function dad(reg, genReg, flagReg){
    let lowByte, highByte;
    let operand1, operand2;

    lowByte = genReg["L"];
    highByte = genReg["H"];

    if(reg === 'B'){
        operand1 = genReg["B"];
        operand2 = genReg["C"];
    }
    else if(reg === 'D'){
        operand1 = genReg["D"];
        operand2 = genReg["E"];
    }
    else if(reg === 'H'){
        operand1 = genReg["H"];
        operand2 = genReg["L"];
    }
    else if(reg === 'SP'){
        operand1 = genReg["SP"].slice(0,2);
        operand2 = genReg["SP"].slice(2);
    }

    lowByte = parseInt(lowByte, 16);
    operand2 = parseInt(operand2, 16);
    highByte = parseInt(highByte, 16);
    operand1 = parseInt(operand1, 16);

    lowByte = lowByte + operand2;
    highByte = highByte + operand1;

    if(parseInt(lowByte / 256) === 1){
        highByte += 1;
    }
    if(parseInt(highByte / 256) === 1){
        flagReg["CY"] = "01";
    }
    else{
        flagReg["CY"] = "00";
    }

    lowByte = lowByte.toString(16)
                .toUpperCase()
                .padStart(2, '0')
                .slice(-2);
    
    highByte = highByte.toString(16)
                .toUpperCase()
                .padStart(2, '0')
                .slice(-2);

    genReg["H"] = highByte;
    genReg["L"] = lowByte;

    return [genReg, flagReg];
}


function dcr(reg, genReg, flagReg) {
    let operand = genReg[reg];

    operand = parseInt(operand, 16);
    operand -= 1;
    flagReg = setFlagReg(operand, flagReg);
    operand = operand.toString(16);
    operand = operand.toUpperCase().padStart(2, "0").slice(-2);
    genReg[reg] = operand;

    return [genReg, flagReg];
}


function dcx(reg, genReg){
    let operand;
    if(reg === 'B'){
        operand = genReg['B'] + genReg['C'];
    }
    else if(reg === 'D'){
        operand = genReg['D'] + genReg['E'];
    }
    else if(reg === 'H'){
        operand = genReg['H'] + genReg['L'];
    }
    else if(reg === 'SP'){
        operand = genReg['SP'];
    }

    operand = parseInt(operand, 16);
    operand -= 1;
    operand = operand.toString(16).toUpperCase().padStart(4, '0').slice(-4);
    
    if(reg === 'B'){
        genReg['B'] = operand.slice(0,2);
        genReg['C'] = operand.slice(2);
    }
    else if(reg === 'D'){
        genReg['D'] = operand.slice(0,2);
        genReg['E'] = operand.slice(2);
    }
    else if(reg === 'H'){
        genReg['H'] = operand.slice(0,2);
        genReg['L'] = operand.slice(2);
    }
    else if(reg === 'SP'){
        genReg['SP'] = operand;
    }

    return genReg;
}


function inr(reg, genReg, flagReg) {
    let operand = genReg[reg];

    operand = parseInt(operand, 16);

    operand += 1;
    operand = operand.toString(16);
    flagReg = setFlagReg(operand, flagReg);
    operand = operand.toUpperCase().padStart(2, "0").slice(-2);
    genReg[reg] = operand;

    return [genReg, flagReg];
}

function inx(reg, genReg) {
    let operand;

    switch (reg) {
        case "B":
            operand = genReg["B"] + genReg["C"];
            operand = parseInt(operand, 16);
            operand++;
            operand = operand.toString(16).toUpperCase().padStart(4, "0");
            genReg["B"] = operand.slice(0, 2);
            genReg["C"] = operand.slice(-2);
            break;

        case "D":
            operand = genReg["D"] + genReg["E"];
            operand = parseInt(operand, 16);
            operand++;
            operand = operand.toString(16).toUpperCase().padStart(4, "0");
            genReg["D"] = operand.slice(0, 2);
            genReg["E"] = operand.slice(-2);
            break;

        case "H":
            operand = genReg["H"] + genReg["L"];
            operand = parseInt(operand, 16);
            operand++;
            operand = operand.toString(16).toUpperCase().padStart(4, "0");
            genReg["H"] = operand.slice(0, 2);
            genReg["L"] = operand.slice(-2);
            break;

        case "SP":
            operand = genReg["SP"];
            operand = parseInt(operand, 16);
            operand++;
            operand = operand
                .toString(16)
                .toUpperCase()
                .padStart(4, "0")
                .slice(-4);
            genReg["SP"] = operand;
            break;

        default:
            console.log("lol");
    }

    return genReg;
}

function lxi(reg, byte3, byte2, genReg) {
    switch (reg) {
        case "B":
            genReg["B"] = byte2;
            genReg["C"] = byte3;
            break;

        case "D":
            genReg["D"] = byte2;
            genReg["E"] = byte3;
            break;

        case "H":
            genReg["H"] = byte2;
            genReg["L"] = byte3;
            break;

        case "SP":
            genReg["SP"] = byte2 + byte3;
            break;

        default:
            console.log("oh damn!");
    }
    return genReg;
}


function ldax(reg, genReg, memory){
    let tempAdd;

    if(reg === "B"){
        tempAdd = genReg["B"] + genReg["C"];
    }
    if(reg === "D"){
        tempAdd = genReg["D"] + genReg["E"];
    }

    tempAdd = parseInt(tempAdd, 16);
    let memoryIndex = getMemoryIndex(tempAdd);

    genReg["A"] = memory[memoryIndex[0]][memoryIndex[1]];

    return genReg;
}


function ora(reg, genReg){
    let operand1 = genReg['A'];
    let operand2 = genReg[reg];

    operand1 = parseInt(operand1, 16);
    operand2 = parseInt(operand2, 16);

    operand1 = operand1 | operand2;
    operand1 = operand1.toString(16)
                .toUpperCase()
                .padStart(2, '0')
                .slice(-2);

    genReg['A'] = operand1;
    return genReg;
}


function stax(reg, genReg, memory){
    let tempAdd;
    if(reg === 'B')
        tempAdd = genReg["B"] + genReg["C"];
    else if(reg === 'D')
        tempAdd = genReg["D"] + genReg["E"];

    tempAdd = parseInt(tempAdd, 16);
    let memoryIndex = getMemoryIndex(tempAdd);

    memory[memoryIndex[0]][memoryIndex[1]] = genReg["A"];

    return memory;
}


function instruction_def(instruction, genReg, flagReg, memory) {
    let tempAdd;
    let memoryIndex;
    let reg;
    let byte3;
    let byte2;
    let numBytes;
    let pc;

    let opcode = instruction[0];

    switch (opcode) {
        ///////////////////////////////////////////////////////////////////////////////////

        // ACI statement
        case "CE":
            // ACI 8bit_data
            byte2 = instruction[1];
            byte2 = parseInt(byte2, 16);
            genReg["A"] =
                parseInt(genReg["A"]) + byte2 + parseInt(flagReg["CY"]);
            flagReg = setFlagReg(genReg["A"], flagReg);
            genReg["A"] = genReg["A"]
                .toString(16)
                .toUpperCase()
                .padStart(2, "0")
                .slice(-2);

            numBytes = 2;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ADC statements
        case "8F":
            // ADC A
            reg = adc("A", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "88":
            // ADC B
            reg = adc("B", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "89":
            // ADC C
            reg = adc("C", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "8A":
            // ADC D
            reg = adc("D", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "8B":
            // ADC E
            reg = adc("E", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "8C":
            // ADC F
            reg = adc("F", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "8D":
            // ADC L
            reg = adc("L", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "8E":
            // ADC M
            reg = adc("M", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ADD statements
        case "87":
            // ADD A
            reg = add("A", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "80":
            // ADD B
            reg = add("B", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "81":
            // ADD C
            reg = add("C", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "82":
            // ADD D
            reg = add("D", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "83":
            // ADD E
            reg = add("E", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "84":
            // ADD H
            reg = add("H", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "85":
            // ADD L
            reg = add("L", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "86":
            // ADD M
            reg = add("M", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ADI statement
        case "C6":
            byte2 = instruction[1];
            byte2 = parseInt(byte2, 16);
            genReg["A"] = parseInt(genReg["A"], 16);
            genReg["A"] += byte2;
            flagReg = setFlagReg(genReg["A"], flagReg);
            genReg["A"] = genReg["A"]
                .toString(16)
                .toUpperCase()
                .padStart(2, "0")
                .slice(-2);

            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ANA statements
        case "A7":
            // ANA A
            reg = ana("A", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A0":
            // ANA B
            reg = ana("B", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A1":
            // ANA C
            reg = ana("C", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A2":
            // ANA D
            reg = ana("D", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A3":
            // ANA E
            reg = ana("E", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A4":
            // ANA H
            reg = ana("H", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A5":
            // ANA L
            reg = ana("L", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "A6":
            // ANA M
            reg = ana("M", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ANI statement
        case "E6":
            // ANI 8bit_data
            byte2 = instruction[1];
            byte2 = parseInt(byte2, 16);
            genReg["A"] = parseInt(genReg["A"], 16);
            genReg["A"] = genReg["A"] & byte2;
            flagReg = setFlagReg(genReg["A"], flagReg);
            genReg["A"] = genReg["A"]
                .toString(16)
                .toUpperCase()
                .padStart(2, "0")
                .slice(-2);

            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CALL statement
        case "CD":
            // CALL 16bit_data
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;
           
            reg = call(byte2, byte3, genReg, memory, true);
            genReg = reg[0];
            memory = reg[1];
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CC statement
        case "DC":
            // CC 16bit_data
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["CY"] === '1'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CM statement
        case "FC":
            // CM 16bit_data
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["S"] === '1'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CMA statement
        case "2F":
            // CMA
            genReg["A"] = parseInt(genReg["A"] - 1, 16);
            genReg["A"] = (genReg["A"] >>> 0).toString(2).slice(-8);
            genReg["A"] = parseInt(genReg["A"], 2);
            genReg["A"] = genReg["A"]
                .toString(16)
                .toUpperCase()
                .padStart(2, "0")
                .slice(-2);

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CMC statement
        case "3F":
            // CMC
            if (flagReg["CY"] === "0") {
                flagReg["CY"] = "1";
            } else if (flagReg["CY"] === "1") {
                flagReg["CY"] = "0";
            }
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CMP statements
        case "BF" :
            // CMP A
            flagReg = cmp('A', genReg, flagReg);

            numBytes = 1;
            break;

        case "B8" :
            // CMP B
            flagReg = cmp('B', genReg, flagReg);

            numBytes = 1;
            break;

        case "B9" :
            // CMP C
            flagReg = cmp('C', genReg, flagReg);

            numBytes = 1;
            break;

        case "BA" :
            // CMP D
            flagReg = cmp('D', genReg, flagReg);

            numBytes = 1;
            break;

        case "BB" :
            // CMP E
            flagReg = cmp('E', genReg, flagReg);

            numBytes = 1;
            break;

        case "BC" :
            // CMP H
            flagReg = cmp('H', genReg, flagReg);

            numBytes = 1;
            break;

        case "BD" :
            // CMP L
            flagReg = cmp('L', genReg, flagReg);

            numBytes = 1;
            break;

        case "BE" :
            // CMP M
            flagReg = cmp('M', genReg, flagReg);

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CNC statement
        case "D4" :
            // CNC 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["CY"] === '0'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CNZ statement
        case "C4" :
            // CNZ 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["Z"] === '0'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CP statement
        case "F4" :
            // CP 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["S"] === '0'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CPE statement
        case "EC" :
            // CPE 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["P"] === '1'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CPI statement
        case "FE" :
            // CPI 8bit_data
            byte2 = instruction[1];
            reg = genReg['A'] - byte2;
            flagReg = setFlagReg(reg, flagReg);

            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CPO statement
        case "E4" :
            // CPO 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["P"] === '0'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // CZ statement
        case "CC" :
            // CZ 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            numBytes = 3;

            if(flagReg["Z"] === '1'){
                reg = call(byte2, byte3, genReg, memory, true);
            }
            else{
                reg = call(byte2, byte3, genReg, memory, false);
            }
            genReg = reg[0];
            memory = reg[1];
            
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // DAA statement
        case "27" :
            // DAA


            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // DAD statements
        case "09" :
            // DAD B
            reg = dad('B', genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "19" :
            // DAD D
            reg = dad('B', genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "29" :
            // DAD H
            reg = dad('B', genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        case "39" :
            // DAD SP
            reg = dad('SP', genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // DCR statements
        case "3D":
            // DCR A
            reg = dcr("A", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "05":
            // DCR B
            reg = dcr("B", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "0D":
            // DCR C
            reg = dcr("C", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "15":
            // DCR D
            reg = dcr("D", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "1D":
            // DCR E
            reg = dcr("E", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "25":
            // DCR H
            reg = dcr("H", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "2D":
            // DCR L
            reg = dcr("L", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "35":
            // DCR M
            reg = dcr("M", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // DCX statements
        case "0B" :
            // DCX B
            genReg = dcx('B', genReg);
            numBytes = 1;
            break;

        case "1B" :
            // DCX D
            genReg = dcx('D', genReg);
            numBytes = 1;
            break;

        case "2B" :
            // DCX H
            genReg = dcx('H', genReg);
            numBytes = 1;
            break;

        case "3B" :
            // DCX SP
            genReg = dcx('SP', genReg);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // DI statement
        case "F3" :
            // DI

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // EI statement
        case "FB" :
            // EI

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // HLT statement
        case "76":
            // HLT

            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // IN statement
        case "DB" :
            // IN 8bit_address
            
            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // INR statements
        case "3C":
            // INR A
            reg = inr("A", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "04":
            // INR B
            reg = inr("B", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "0C":
            // INR C
            reg = inr("C", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "14":
            // INR D
            reg = inr("D", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "1C":
            // INR E
            reg = inr("E", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "24":
            // INR H
            reg = inr("H", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "2C":
            // INR L
            reg = inr("L", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        case "34":
            // INR M
            reg = inr("M", genReg, flagReg);
            genReg = reg[0];
            flagReg = reg[1];

            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // INX statements
        case "03":
            // INX B
            genReg = inx("B", genReg);

            numBytes = 1;

            break;

        case "13":
            // INX D
            genReg = inx("D", genReg);

            numBytes = 1;

            break;

        case "23":
            // INX H
            genReg = inx("H", genReg);

            numBytes = 1;

            break;

        case "33":
            // INX SP
            genReg = inx("SP", genReg);

            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JC statement
        case "DA" :
            // JC 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            tempAdd = byte2 + byte3;
            if(flagReg["CY"] === '1'){
                genReg["PC"] = tempAdd;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JM statement
        case "FA" :
            // JM 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            tempAdd = byte2 + byte3;
            if(flagReg["S"] === '1'){
                genReg["PC"] = tempAdd;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JMP statement
        case "C3" :
            // JMP 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            tempAdd = byte2 + byte3;
            genReg["PC"] = tempAdd;
        
            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JNC statement
        case "D2":
            // JNC 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];

            if (flagReg["CY"] === "0") {
                genReg["PC"] = byte2 + byte3;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JNZ statement
        case "C2":
            // JNZ 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];

            if (flagReg["Z"] === "0") {
                genReg["PC"] = byte2 + byte3;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JP statement
        case "F2":
            // JP 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];

            if (flagReg["S"] === "0") {
                genReg["PC"] = byte2 + byte3;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JPE statement
        case "EA":
            // JPE 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];

            if (flagReg["P"] === "1") {
                genReg["PC"] = byte2 + byte3;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JPO statement
        case "E2":
            // JPO 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];

            if (flagReg["P"] === "0") {
                genReg["PC"] = byte2 + byte3;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // JZ statement
        case "CA":
            // JZ 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];

            if (flagReg["Z"] === "1") {
                genReg["PC"] = byte2 + byte3;
            } else {
                let pc = genReg["PC"];
                pc = parseInt(pc, 16) + 3;
                pc = pc.toString(16).toUpperCase().padStart(4, "0");
                genReg["PC"] = pc;
            }

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // LDA statement
        case "3A" :
            // LDA 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            tempAdd = byte2 + byte3;
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["A"] = memory[memoryIndex[0]][memoryIndex[1]]
                .toString(16)
                .padStart(2, '0');
            numBytes = 3;
            break;
        
        ///////////////////////////////////////////////////////////////////////////////////

        // LDAX statements
        case "0A" :
            // LDAX B
            genReg = ldax('B', genReg, memory);
            numBytes = 1;
            break;

        case "1A" :
            // LDAX D
            genReg = ldax('D', genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // LHLD
        case "2A" :
            // LHLD 16bit_address
            byte2 = instruction[2];
            byte3 = instruction[1];
            tempAdd = byte2 + byte3;

            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["L"] = memory[memoryIndex[0]][memoryIndex[1]];

            tempAdd += 1;
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["H"] = memory[memoryIndex[0]][memoryIndex[1]];

            numBytes = 3;
            break;

        // LXI statements
        case "01":
            // LXI B 16bit_data
            reg = "B";
            byte3 = instruction[1];
            byte2 = instruction[2];

            genReg = lxi(reg, byte3, byte2, genReg);

            numBytes = 3;

            break;

        case "11":
            // LXI D 16bit_data
            reg = "D";
            byte3 = instruction[1];
            byte2 = instruction[2];

            genReg = lxi(reg, byte3, byte2, genReg);

            numBytes = 3;

            break;

        case "21":
            // LXI H 16bit_data
            reg = "H";
            byte3 = instruction[1];
            byte2 = instruction[2];

            genReg = lxi(reg, byte3, byte2, genReg);

            numBytes = 3;

            break;

        case "31":
            // LXI SP 16bit_data
            reg = "SP";
            byte3 = instruction[1];
            byte2 = instruction[2];

            genReg = lxi(reg, byte3, byte2, genReg);

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // MOV statements
        case "7F":
            // MOV A A

            numBytes = 1;

            break;

        case "78":
            // MOV A B
            genReg["A"] = genReg["B"];

            numBytes = 1;

            break;

        case "79":
            // MOV A C
            genReg["A"] = genReg["C"];

            numBytes = 1;

            break;

        case "7A":
            // MOV A D
            genReg["A"] = genReg["D"];

            numBytes = 1;

            break;

        case "7B":
            // MOV A E
            genReg["A"] = genReg["E"];

            numBytes = 1;

            break;

        case "7C":
            // MOV A H
            genReg["A"] = genReg["H"];

            numBytes = 1;

            break;

        case "7D":
            // MOV A L
            genReg["A"] = genReg["L"];

            numBytes = 1;

            break;

        case "7E":
            // MOV A M
            genReg["A"] = genReg["M"];

            numBytes = 1;

            break;

        case "47":
            // MOV B A
            genReg["B"] = genReg["A"];

            numBytes = 1;

            break;

        case "40":
            // MOV B B

            numBytes = 1;

            break;

        case "41":
            // MOV B C
            genReg["B"] = genReg["C"];

            numBytes = 1;

            break;

        case "42":
            // MOV B D
            genReg["B"] = genReg["D"];

            numBytes = 1;

            break;

        case "43":
            // MOV B E
            genReg["B"] = genReg["E"];

            numBytes = 1;

            break;

        case "44":
            // MOV B H
            genReg["B"] = genReg["H"];

            numBytes = 1;

            break;

        case "45":
            // MOV B L
            genReg["B"] = genReg["L"];

            numBytes = 1;

            break;

        case "46":
            // MOV B M
            genReg["B"] = genReg["M"];

            numBytes = 1;

            break;

        case "4F":
            // MOV C A
            genReg["C"] = genReg["A"];

            numBytes = 1;

            break;

        case "48":
            // MOV C B
            genReg["C"] = genReg["B"];

            numBytes = 1;

            break;

        case "49":
            // MOV C C

            numBytes = 1;

            break;

        case "4A":
            // MOV C D
            genReg["C"] = genReg["D"];

            numBytes = 1;

            break;

        case "4B":
            // MOV C E
            genReg["C"] = genReg["E"];

            numBytes = 1;

            break;

        case "4C":
            // MOV C H
            genReg["C"] = genReg["H"];

            numBytes = 1;

            break;

        case "4D":
            // MOV C L
            genReg["C"] = genReg["L"];

            numBytes = 1;

            break;

        case "4E":
            // MOV C M
            genReg["C"] = genReg["M"];

            numBytes = 1;

            break;

        case "57":
            // MOV D A
            genReg["D"] = genReg["A"];

            numBytes = 1;

            break;

        case "50":
            // MOV D B
            genReg["D"] = genReg["B"];

            numBytes = 1;

            break;

        case "51":
            // MOV D C
            genReg["D"] = genReg["C"];

            numBytes = 1;

            break;

        case "52":
            // MOV D D

            numBytes = 1;

            break;

        case "53":
            // MOV D E
            genReg["D"] = genReg["E"];

            numBytes = 1;

            break;

        case "54":
            // MOV D H
            genReg["D"] = genReg["H"];

            numBytes = 1;

            break;

        case "55":
            // MOV D L
            genReg["D"] = genReg["L"];

            numBytes = 1;

            break;

        case "56":
            // MOV D M
            genReg["D"] = genReg["M"];

            numBytes = 1;

            break;

        case "5F":
            // MOV E A
            genReg["E"] = genReg["A"];

            numBytes = 1;

            break;

        case "58":
            // MOV E B
            genReg["E"] = genReg["B"];

            numBytes = 1;

            break;

        case "59":
            // MOV E C
            genReg["E"] = genReg["C"];

            numBytes = 1;

            break;

        case "5A":
            // MOV E D
            genReg["E"] = genReg["D"];

            numBytes = 1;

            break;

        case "5B":
            // MOV E E

            numBytes = 1;

            break;

        case "5C":
            // MOV E H
            genReg["E"] = genReg["H"];

            numBytes = 1;

            break;

        case "5D":
            // MOV E L
            genReg["E"] = genReg["L"];

            numBytes = 1;

            break;

        case "5E":
            // MOV E M
            genReg["E"] = genReg["M"];

            numBytes = 1;

            break;

        case "67":
            // MOV H A
            genReg["H"] = genReg["A"];

            numBytes = 1;

            break;

        case "60":
            // MOV H B
            genReg["H"] = genReg["B"];

            numBytes = 1;

            break;

        case "61":
            // MOV H C
            genReg["H"] = genReg["C"];

            numBytes = 1;

            break;

        case "62":
            // MOV H D
            genReg["H"] = genReg["D"];

            numBytes = 1;

            break;

        case "63":
            // MOV H E
            genReg["H"] = genReg["E"];

            numBytes = 1;

            break;

        case "64":
            // MOV H H

            numBytes = 1;

            break;

        case "65":
            // MOV H L
            genReg["H"] = genReg["L"];

            numBytes = 1;

            break;

        case "66":
            // MOV H M
            genReg["H"] = genReg["M"];

            numBytes = 1;

            break;

        case "6F":
            // MOV L A
            genReg["L"] = genReg["A"];

            numBytes = 1;

            break;

        case "68":
            // MOV L B
            genReg["L"] = genReg["B"];

            numBytes = 1;

            break;

        case "69":
            // MOV L C
            genReg["L"] = genReg["C"];

            numBytes = 1;

            break;

        case "6A":
            // MOV L D
            genReg["L"] = genReg["D"];

            numBytes = 1;

            break;

        case "6B":
            // MOV L E
            genReg["L"] = genReg["E"];

            numBytes = 1;

            break;

        case "6C":
            // MOV L H
            genReg["L"] = genReg["H"];

            numBytes = 1;

            break;

        case "6D":
            // MOV L L

            numBytes = 1;

            break;

        case "6E":
            // MOV L M
            genReg["L"] = genReg["M"];

            numBytes = 1;

            break;

        case "77":
            // MOV M A
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["A"];

            genReg["M"] = genReg["A"];
            numBytes = 1;

            break;

        case "70":
            // MOV M B
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["B"];

            genReg["M"] = genReg["B"];
            numBytes = 1;

            break;

        case "71":
            // MOV M C
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["C"];

            genReg["M"] = genReg["C"];
            numBytes = 1;

            break;

        case "72":
            // MOV M D
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["D"];

            genReg["M"] = genReg["D"];
            numBytes = 1;

            break;

        case "73":
            // MOV M E
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["E"];

            genReg["M"] = genReg["E"];
            numBytes = 1;

            break;

        case "74":
            // MOV M H
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["H"];

            genReg["M"] = genReg["H"];
            numBytes = 1;

            break;

        case "75":
            // MOV M L
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["L"];

            genReg["M"] = genReg["L"];
            numBytes = 1;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // MVI statements
        case "3E":
            // MVI A 8bit_data
            byte2 = instruction[1];
            genReg["A"] = byte2;

            numBytes = 2;

            break;

        case "06":
            // MVI B 8bit_data
            byte2 = instruction[1];
            genReg["B"] = byte2;

            numBytes = 2;

            break;

        case "0E":
            // MVI C 8bit_data
            byte2 = instruction[1];
            genReg["C"] = byte2;

            numBytes = 2;

            break;

        case "16":
            // MVI D 8bit_data
            byte2 = instruction[1];
            genReg["D"] = byte2;

            numBytes = 2;

            break;

        case "1E":
            // MVI E 8bit_data
            byte2 = instruction[1];
            genReg["E"] = byte2;

            numBytes = 2;

            break;

        case "26":
            // MVI H 8bit_data
            byte2 = instruction[1];
            genReg["H"] = byte2;

            numBytes = 2;

            break;

        case "2E":
            // MVI L 8bit_data
            byte2 = instruction[1];
            genReg["L"] = byte2;

            numBytes = 2;

            break;

        case "36":
            // MVI M 8bit_data
            byte2 = instruction[1];
            tempAdd = genReg["H"] + genReg["L"];
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = byte2;
            genReg["M"] = byte2;

            numBytes = 2;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // NOP statement
        case "00" :
            // NOP
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ORA statements
        case "B7" :
            // ORA A
            genReg = ora('A', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B0" :
            // ORA B
            genReg = ora('B', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B1" :
            // ORA C
            genReg = ora('C', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B2" :
            // ORA D
            genReg = ora('D', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B3" :
            // ORA E
            genReg = ora('E', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B4" :
            // ORA H
            genReg = ora('H', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B5" :
            // ORA L
            genReg = ora('L', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        case "B6" :
            // ORA M
            genReg = ora('M', genReg);
            flagReg = setFlagReg(genReg['A'], flagReg);

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // ORI statement
        case "F6" :
            // ORI 8bit_data
            byte2 = instruction[1];
            byte2 = parseInt(byte2, 16);
            reg = genReg['A'];
            reg = parseInt(reg, 16);
            reg = reg | byte2;
            reg = reg.toString(16)
                    .toUpperCase()
                    .padStart(2, '0')
                    .slice(-2);
            genReg['A'] = reg;

            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // OUT statement
        case "D3" :
            // OUT 8bit_address

            numBytes = 2;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // PCHL statement
        case "E9" :
            // PCHL
            genReg["PC"] = genReg['H'] + genReg['L'];

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // POP statements
        case "C1" :
            // POP B

            numBytes = 1;
            break;

        case "D1" :
            // POP D

            numBytes = 1;
            break;

        case "E1" :
            // POP H

            numBytes = 1;
            break;

        case "F1" :
            // POP PSW

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // PUSH statements
        case "C5" :
            // PUSH B

            numBytes = 1;
            break;

        case "D5" :
            // PUSH D

            numBytes = 1;
            break;

        case "E5" :
            // PUSH E

            numBytes = 1;
            break;

        case "F5" :
            // PUSH PSW

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // RAL statement
        

        ///////////////////////////////////////////////////////////////////////////////////

        // RAR statement


        ///////////////////////////////////////////////////////////////////////////////////

        // RC statement


        ///////////////////////////////////////////////////////////////////////////////////

        // RET statement
        case "C9" :
            tempAdd = genReg["SP"];
            tempAdd = parseInt(tempAdd, 16);

            memoryIndex = getMemoryIndex(tempAdd);
            byte2 = memory[memoryIndex[0]][memoryIndex[1]];
            tempAdd--;
            memoryIndex = getMemoryIndex(tempAdd);
            byte3 = memory[memoryIndex[0]][memoryIndex[1]];
            tempAdd--;

            tempAdd = tempAdd.toString(16)
                            .toUpperCase()
                            .padStart(4, '0')
                            .slice(-4);
            genReg["SP"] = tempAdd;

            tempAdd = byte2 + byte3;
            genReg["PC"] = tempAdd;

            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // RIM statement


        /////////////////////////////////////////////////////////////////////////////////////

        // RLC statement


        ///////////////////////////////////////////////////////////////////////////////////
     
        // RM statement


        /////////////////////////////////////////////////////////////////////////////////////

        // RNC statement


        ///////////////////////////////////////////////////////////////////////////////////

        // RNZ statement
        

        ///////////////////////////////////////////////////////////////////////////////////
        
        // RP statement
        

        ///////////////////////////////////////////////////////////////////////////////////

        // RPE statement
            

        ///////////////////////////////////////////////////////////////////////////////////

        // RPO statement
        

        ///////////////////////////////////////////////////////////////////////////////////

        // RRC statement
        

        ///////////////////////////////////////////////////////////////////////////////////

        
        // SHLD statement
        case "22" :
            // SHLD 16bit_data
            byte3 = instruction[1];
            byte2 = instruction[2];
            tempAdd = byte2 + byte3;

            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["L"];
            
            tempAdd += 1;
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["H"];

            numBytes = 3;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // SPHL statement
        case "F9" :
            // SPHL
            genReg["SP"] = genReg["H"] + genReg["L"];

            numBytes = 1;
            break;

        // STA statement
        case "32":
            byte3 = instruction[1];
            byte2 = instruction[2];

            tempAdd = byte2 + byte3;
            tempAdd = parseInt(tempAdd, 16);
            memoryIndex = getMemoryIndex(tempAdd);

            reg = genReg["A"];

            memory[memoryIndex[0]][memoryIndex[1]] = reg;

            // console.log(reg);
            // console.log(memory[[memoryIndex[0]][memoryIndex[1]]]);
            // console.log(memory[[memoryIndex[0]][memoryIndex[1]+1]]);
            // console.log(memory[[memoryIndex[0]][memoryIndex[1]+2]]);

            numBytes = 3;

            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // STAX statements
        case "02" :
            // STAX B
            memory = stax('B', genReg, memory);
            numBytes = 1;
            break;

        case "12" :
            // STAX D
            memory = stax('D', genReg, memory);
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        // STC statement
        case "37" :
            // STC
            flagReg["CY"] = "01";
            numBytes = 1;
            break;

        ///////////////////////////////////////////////////////////////////////////////////

        default:
            console.log(opcode);
    }

    if (
        instruction[0] !== "DA" &&
        instruction[0] !== "FA" &&
        instruction[0] !== "C3" &&
        instruction[0] !== "D2" &&
        instruction[0] !== "C2" &&
        instruction[0] !== "F2" &&
        instruction[0] !== "EA" &&
        instruction[0] !== "E2" &&
        instruction[0] !== "CA" &&
        instruction[0] !== "CD" &&
        instruction[0] !== "DC" &&
        instruction[0] !== "FC" &&
        instruction[0] !== "D4" &&
        instruction[0] !== "C4" &&
        instruction[0] !== "F4" &&
        instruction[0] !== "EC" &&
        instruction[0] !== "E4" &&
        instruction[0] !== "CC" &&
        instruction[0] !== "C9"
    ) {
        let pc = genReg["PC"];
        pc = parseInt(pc, 16) + numBytes;
        pc = pc.toString(16).toUpperCase().padStart(4, "0");
        genReg["PC"] = pc;
    }

    return {
        primaryRegisters: genReg,
        flagRegisters: flagReg,
        memory: memory
    };
}

export { execute };

// let input =  {
//     instructions: [
//             [ "02" ]
//         ],
//     "start-instruction": 0,
//     steps: 1,
//     "primary-registers": {
//         A: "00",
//         B: "00",
//         C: "00",
//         D: "00",
//         E: "00",
//         H: "AB",
//         L: "CD",
//         M: "00",
//         PC: "0000"
//     },

//     "flag-registers": {
//         S: "00",
//         Z: "00",
//         P: "00",
//         CY: "00",
//         AC: "00",
//     },

//     memory: new Array(4096).fill(0).map(() => new Array(16).fill("00"))
// };

// execute(input);
