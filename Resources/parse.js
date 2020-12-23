/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

const { registers, numBytes, opcode, memLoc, label } = require(__dirname + '/dataStructures.js');

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

// to print all register contents
function showAllRegContents(){
    for(let reg in registers){
        console.log(registers[reg]);
    }
}


// to check if the given data is a hexidecimal or not
function isHex(operand){
    let isHex = true;
    let len = operand.length;

    for(let i=0;i<len;i++){
        if (!((operand[i] >= '0' && operand[i] <= '9') || (operand[i] >= 'A' && operand[i] <= 'F'))){
            isHex = false;
        }
    }

    return isHex;
}


/* 
    Checks whether a given instruction is valid or not.
    Returns false if the instruction is valid, else returns true
*/
function checkInstructionError(instruction){
    let isError = false;

    try{

        //for 1 byte instructions
        if (instruction in opcode){
            return isError;
        }

        else{
            let mnemonic = (instruction.split(' '))[0];

            // for 2 byte instructions like ADI and all 3 byte instructions
            if (mnemonic in opcode){
                let operand = (instruction.split(' '))[1];
                let instructionSize = numBytes[mnemonic];

                // for 2 byte instructions like ADI
                if (instructionSize == 2){

                    // to check if the operand is of 1 byte size
                    if (operand.length != 2){
                        isError = true;
                        return isError;
                    }

                    // to check if the operand is a hex number
                    isError = !isHex(operand);
                }

                // for all 3 byte instructions
                else if (instructionSize == 3){
                    
                    // to check if operand is a label
                    if (operand in label){
                        return isError;
                    }

                    // to check whether operand is 2 bytes
                    if (operand.length != 4){
                        isError = true;
                        return isError;
                    }

                    isError = !isHex(operand);

                }

                return isError;
            }

            // for 2 byte instructions like MVI A
            else{
                mnemonic = mnemonic + " " + instruction.split(' ')[1];

                if (mnemonic in opcode){
                    operand = instruction.split(' ')[2];

                    if (operand.length != 2){
                        isError = true;
                    }

                    isError = !isHex(operand);

                }
                else{
                    isError = true;
                }

                return isError;

            }
        }
    }
    catch(error){
        console.log(error);
        isError = true;
        return isError;
    }
}


// to parse the instruction to object code

function parse(instruction){
    try{
        let isError = checkInstructionError(instruction);

        if (isError){
            throw "Invalid instruction!";
        }

        let code = [];
        let instructionSize = 0;

        // for 1 byte instructions
        if (instruction in opcode){
            code = [opcode[instruction]];

        }

        // for all 2 & 3 byte instructions
        else{
            let mnemonic = instruction.split(' ')[0];

            // for 2 byte instructions like ADI and all 3 byte instructions
            if (mnemonic in numBytes){
                instructionSize = numBytes[mnemonic];
            }

            // for 2 byte instructions like MVI A
            else{
                mnemonic = mnemonic + " " + instruction.split(' ')[1];
                instructionSize = numBytes[mnemonic];
            }

            // for 2 byte instructions 
            if (instructionSize == 2) {
                if (instruction.split(' ')[0] in opcode){
                    code = [opcode[mnemonic], instruction.split(' ')[1]];

                }
                else{
                    code = [opcode[mnemonic], instruction.split(' ')[2]];
                }
            }

            // for 3 byte instructions
            else if (instructionSize == 3){
                if (instruction.split(' ')[1] in label){
                    let operand = label[instruction.split(' ')[1]]; 
                    code = [opcode[mnemonic], operand.slice(2), operand.slice(0,2)];

                }

                else{
                    let operand = instruction.split(' ')[1];
                    code = [opcode[mnemonic], operand.slice(2), operand.slice(0,2)];
                }
            }
        }

        return code;
    }
    catch(error){
        return error;
    }
}

module.exports = {checkInstructionError, parse};



// // console.log(checkInstructionError("MOV A B"));
// // console.log(checkInstructionError("MOV A C"));
// // console.log(checkInstructionError("MVI A 36"));
// // console.log(checkInstructionError("MVI A AB"));
// // console.log(checkInstructionError("MVI A 3Z"));
// // console.log(checkInstructionError("ADI A 36"));
// // console.log(checkInstructionError("ADI 45"));
// // console.log(checkInstructionError("ADI 4"));
// console.log(checkInstructionError("STA 4500"));
// // console.log(checkInstructionError("STA 45002"));
// // console.log(checkInstructionError("STA XYZ"));
// // console.log(checkInstructionError("STA LOC"));

// console.log(parse("MOV A B"));
// console.log(parse("MOV A C"));
// console.log(parse("MVI A 36"));
// console.log(parse("MVI A AB"));
// console.log(parse("MVI A 3Z"));
// console.log(parse("ADI A 36"));
// console.log(parse("ADI 45"));
// console.log(parse("ADI 4"));
// console.log(parse("STA 4500"));
// console.log(parse("STA 45002"));
// console.log(parse("STA XYZ"));
// console.log(parse("STA LOC"));

// console.log(getInstructions(["MOV","A","B"]));
// instruction = getInstructions(["MOV","A","B"]);
// console.log(parse(instruction));