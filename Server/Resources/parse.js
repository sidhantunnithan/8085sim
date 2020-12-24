/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

const { registers, numBytes, opcode, memLoc, label } = require(__dirname + '/dataStructures.js');

const errorDict = {
    0 : "No Error",
    1 : "Invalid instruction",
    2 : "Invalid operand",
    3 : "Unknown label",
    4 : "Unknown error"
};

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
    let errorCode = 0;
    
    try{

        //for 1 byte instructions
        if (instruction in opcode){
            return [isError, errorCode];
        }

        else{
            let mnemonic = (instruction.split(' '))[0];

            // for 2 byte instructions like ADI and 3 byte instructions like STA
            if (mnemonic in opcode){
                let operand = (instruction.split(' '))[1];
                let instructionSize = numBytes[mnemonic];

                // for 2 byte instructions like ADI
                if (instructionSize == 2){

                    // to check if the operand is of 1 byte size
                    if (operand.length != 2 || !isHex(operand)){
                        isError = true;
                        errorCode = 2;
                        return [isError, errorCode];
                    }

                }

                // for all 3 byte instructions
                else if (instructionSize == 3){
                    
                    // to check if operand is a label
                    if (operand in label){
                        operand = String(label[operand]);
                    }

                    // to check whether operand is 2 bytes
                    if (operand.length != 4 || !isHex(operand)){
                        isError = true;
                        errorCode = 2;
                        return [isError, errorCode];
                    }

                }

                return [isError, errorCode];
            }

            // for 2 byte instructions like MVI A and 3 byte instructions like LXI H
            else{
                mnemonic = mnemonic + " " + instruction.split(' ')[1];

                if (mnemonic in opcode){
                    operand = instruction.split(' ')[2];
                    
                    if(numBytes[mnemonic] == 2){
                        if (operand.length != 2 || !isHex(operand)){
                            isError = true;
                            errorCode = 2;
                        }

                    }
                    
                    if(numBytes[mnemonic] == 3){
                        if ((operand.length != 4 || !isHex(operand)) && !(operand in label)){
                            isError = true;
                            errorCode = 2;
                        }
    
                    }
                }
                else{
                    isError = true;
                    errorCode = 1;
                }

                return [isError, errorCode];

            }
        }
    }
    catch(error){
        console.log(error);
        isError = true;
        errorCode = 4;
        return [isError, errorCode];
    }
}


// to parse the instruction to object code

function parse(instruction){
    try{
        let err = checkInstructionError(instruction);

        if (err[0]){
            throw err;
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

            // for 2 byte instructions like ADI and 3 byte instructions like STA
            if(mnemonic in numBytes){
                instructionSize = numBytes[mnemonic];

                // for 2 byte instructions like ADI
                if(instructionSize == 2){
                    code = [opcode[mnemonic], instruction.split(' ')[1]];
                }
                // for 3 byte instructions like STA
                else if(instructionSize == 3){
                    operand = instruction.split(' ')[1];
                    if(operand in label)
                        operand = String(label[operand]);
                    
                    code = [opcode[mnemonic], operand.slice(2), operand.slice(0,2)];
                }
            }
            // for 2 byte instructions like MVI A and 3 byte instructions like LXI H
            else{
                mnemonic = mnemonic + " " + instruction.split(' ')[1];
                instructionSize = numBytes[mnemonic];

                // for 2 byte instructions like MVI A
                if(instructionSize == 2){
                    code = [opcode[mnemonic], instruction.split(' ')[2]];
                }
                // for 3 byte instructions like LXI H
                else{
                    operand = instruction.split(' ')[2];
                    if(operand in label)
                        operand = String(label[operand]);

                    code = [opcode[mnemonic], operand.slice(2), operand.slice(0,2)];
                }
            }
        }

        return code;
    }
    catch(error){
        return errorDict[error[1]];
    }
}

module.exports = {checkInstructionError, parse};



// console.log(checkInstructionError("MOV A B"));
// console.log(checkInstructionError("MOV A C"));
// console.log(checkInstructionError("MVI A 36"));
// console.log(checkInstructionError("MVI A AB"));
// console.log(checkInstructionError("MVI A 3Z"));
// console.log(checkInstructionError("ADI A 36"));
// console.log(checkInstructionError("ADI 45"));
// console.log(checkInstructionError("ADI 4"));
// console.log(checkInstructionError("STA 4500"));
// console.log(checkInstructionError("STA 45002"));
// console.log(checkInstructionError("STA XYZ"));
// console.log(checkInstructionError("STA LOC"));
// console.log(checkInstructionError("LXI H 5000"));
// console.log(parse("LXI H 5000"));
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
// console.log(parse("STAf LOC"));

// label["LOC"] = 5000;
// console.log(checkInstructionError("LXI H LOC"));
// console.log(parse("LXI H LOC"));
// console.log(parse("LXI H 5000"));

// console.log(getInstructions(["MOV","A","B"]));
// instruction = getInstructions(["MOV","A","B"]);
// console.log(parse(instruction));
