import { numBytes, opcode } from "./dataStructures";

const errorDict = {
    0: "No Error",
    1: "Invalid instruction",
    2: "Invalid operand",
    3: "Unknown label",
    4: "Unknown error",
};

function isHex(operand) {
    /*  
        Checks if the given data is a hexidecimal or not.
        Returns true if the data is hexadecimal, else returns false.
    */

    let isHex = true;
    let len = operand.length;

    for (let i = 0; i < len; i++) {
        if (
            !(
                (operand[i] >= "0" && operand[i] <= "9") ||
                (operand[i] >= "A" && operand[i] <= "F")
            )
        ) {
            isHex = false;
        }
    }

    return isHex;
}

function checkInstructionError(instruction, label) {
    /* 
        Checks whether a given instruction is valid or not.
        Returns false if the instruction is valid, else returns true.
    */

    let isError = false;
    let errorCode = 0;

    try {
        if (instruction in label) {
            // for labels
            return [isError, errorCode];
        }

        if (instruction in opcode) {
            // for 1 byte instructions
            return [isError, errorCode];
        } else {
            let mnemonic = instruction.split(" ")[0];

            var operand;

            if (mnemonic in opcode) {
                // for 2 byte instructions like ADI and 3 byte instructions like STA
                let operand = instruction.split(" ")[1];
                let instructionSize = numBytes[mnemonic];

                if (instructionSize === 2) {
                    // for 2 byte instructions like ADI
                    if (operand.length !== 2 || !isHex(operand)) {
                        // to check if the operand is of 1 byte size
                        isError = true;
                        errorCode = 2;
                    }
                } else if (instructionSize === 3) {
                    // for 3 byte instructions like STA
                    if (
                        (operand.length !== 4 || !isHex(operand)) &&
                        !(operand + ":" in label)
                    ) {
                        isError = true;
                        errorCode = 2;
                    }
                }

                return [isError, errorCode];
            } else {
                // for 2 byte instructions like MVI A and 3 byte instructions like LXI H
                mnemonic = mnemonic + " " + instruction.split(" ")[1];

                if (mnemonic in opcode) {
                    operand = instruction.split(" ")[2];

                    if (numBytes[mnemonic] === 2) {
                        if (operand.length !== 2 || !isHex(operand)) {
                            isError = true;
                            errorCode = 2;
                        }
                    }

                    if (numBytes[mnemonic] === 3) {
                        if (
                            (operand.length !== 4 || !isHex(operand)) &&
                            !(operand + ":" in label)
                        ) {
                            isError = true;
                            errorCode = 2;
                        }
                    }
                } else {
                    isError = true;
                    errorCode = 1;
                }

                return [isError, errorCode];
            }
        }
    } catch (error) {
        console.log(error);
        isError = true;
        errorCode = 4;
        return [isError, errorCode];
    }
}

function parse(instruction, label) {
    /* 
        Parses the instruction to object code.
        Returns the object code of the instruction if the instruction is valid.
        Else returns error.
    */

    try {
        let err = checkInstructionError(instruction, label);

        if (err[0]) {
            throw err;
        }

        let code = [];
        let instructionSize = 0;
        if (instruction in label) {
            return;
        }

        if (instruction in opcode) {
            // for 1 byte instructions
            code = [opcode[instruction]];
        } else {
            // for all 2 & 3 byte instructions
            let mnemonic = instruction.split(" ")[0];

            if (mnemonic in numBytes) {
                // for 2 byte instructions like ADI and 3 byte instructions like STA
                instructionSize = numBytes[mnemonic];

                if (instructionSize === 2) {
                    // for 2 byte instructions like ADI
                    code = [opcode[mnemonic], instruction.split(" ")[1]];
                } else if (instructionSize === 3) {
                    // for 3 byte instructions like STA
                    var operand = instruction.split(" ")[1];
                    if (operand + ":" in label)
                        operand = String(label[operand + ":"]);

                    code = [
                        opcode[mnemonic],
                        operand.slice(2),
                        operand.slice(0, 2),
                    ];
                }
            } else {
                // for 2 byte instructions like MVI A and 3 byte instructions like LXI H
                mnemonic = mnemonic + " " + instruction.split(" ")[1];
                instructionSize = numBytes[mnemonic];

                if (instructionSize === 2) {
                    // for 2 byte instructions like MVI A
                    code = [opcode[mnemonic], instruction.split(" ")[2]];
                } else {
                    // for 3 byte instructions like LXI H
                    operand = instruction.split(" ")[2];
                    if (operand + ":" in label)
                        operand = String(label[operand + ":"]);

                    code = [
                        opcode[mnemonic],
                        operand.slice(2),
                        operand.slice(0, 2),
                    ];
                }
            }
        }

        return code;
    } catch (error) {
        return errorDict[error[1]];
    }
}

export { checkInstructionError, parse };
