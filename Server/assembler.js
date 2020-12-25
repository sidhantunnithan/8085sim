const {checkInstructionError, parse} = require(__dirname + "/Resources/parse.js")
const { registers, numBytes, opcode } = require(__dirname + '/Resources/dataStructures.js');

const startAddress = "1000";
/* 
    The list of instructions are given as input. The input is like 
    ["MOV", "A", "B", "ADD", "B", ...].
    These are to be joined correctly to form proper instructions.
    Returns the instructions in the preferred format, which is like 
    ["MOV A B", "ADD B", ...]
    Labels are of the format "START:", "LOOP:" etc.
*/

var errorList = [];
var labelList = [];
var label = {};

// adds the labels into the labelList from the given input instructionList
function getLabels(instructionList){
    /* 
        All labels are of the format "[A-Z]*:". For example, "START:", "LOOP:".
        So words found in this format are added to labelList.
    */
   
    let re = /[A-Z]*:/;

    for(var i=0; i<instructionList.length; i++){
        let cur = instructionList[i];
        
        if(re.test(cur)){
            labelList.push(cur);
        }
    }

}


// The program instructions are made from the input
function getInstructions(instructionList){
    /* 
        Any instruction in 8085 assembly language can have a maximum of 3 words,
        like "LXI H 5000". So iterating through every index, we set the 3 words.
        Then we check whether the word 1 (one) alone makes up an instruction, if not
        word 1 (one) + word 2 (two) make up an instruction and so on. The instruction 
        is added to instructionList.
        If an error is found, then the index is of that error is added to errorList.
    */

    let instructions = [];
    let n = 0;

    for(var i=0; i<instructionList.length; i++){
        let curInstruction = "";
        let  one = instructionList[i];
        let  two,  three;
        if(i+1 < instructionList.length)
            two = instructionList[i+1];
        if(i+2 < instructionList.length)
            three = instructionList[i+2];

        if(labelList.includes(one)){
            curInstruction = one;
            instructions.push(curInstruction);
            continue;
        }

        if(one in opcode){
            curInstruction = one;

            if(numBytes[curInstruction] == 2 || numBytes[curInstruction] == 3){
                curInstruction += (" " + two);
                instructions.push(curInstruction);

                i = i + 1;
            }
        }

        if((one + " " + two) in opcode){
            curInstruction =  one + " " +  two;
            
            i = i + 1;

            if(numBytes[curInstruction] == 2 || numBytes[curInstruction] == 3){
                curInstruction = curInstruction + " " + three;
                instructions.push(curInstruction);
                i = i + 1;
            }
            else{
                instructions.push(curInstruction);
            }
        }

        if((one+ " " + two + " " + three) in opcode){
            curInstruction = one + " " + two + " " + three;
            instructions.push(curInstruction);
            i = i + 2;
        }

        // console.log(curInstruction);

        if(curInstruction.length === 0){
            curInstruction = i;
            errorList.push(curInstruction);
        }
        
    }
    return instructions;
}


function getLabelMemoryLocation(instructions){
    let start = parseInt(startAddress);
    let offset = 0;

    for(let i=0; i<instructions.length; i++){
        curAddress = start + offset;

        if(labelList.includes(instructions[i])){
            label[instructions[i]] = curAddress.toString(16).toUpperCase().padStart(4, '0');
        }
        else{
            let curInstruction = instructions[i];
            curInstruction = curInstruction.split(' ');

            let mnemonic = "";
            for(let j=0; j<curInstruction.length; j++){
                mnemonic += (" " + curInstruction[j]);
                mnemonic = mnemonic.trim();

                if(mnemonic in opcode){
                    offset += parseInt(numBytes[mnemonic]);
                }
            }
            
        }

    }
    
}


/* 
    The input will be an array of instructions.
    Returns the opcode of the instructions.
*/
function getOpcodes(instructions){
    
    let opcodeList = [];
    try{
        for(let i=0; i<instructions.length; i++){
            if(checkInstructionError(instructions[i], label)[0]){
                // err = checkInstructionError(instructions[i]);
                // throw(err);
                // console.log("Error")
            }
                
            let code = parse(instructions[i], label);
            // console.log(code);
            opcodeList.push(code);
        }

        return opcodeList;
    }
    catch(err){
        console.log(err[1]);
    }
}

// pgm = "LXI Y 5000 MOV MOV A M";
// instructionList = pgm.split(' ');
// console.log(pgm);
// console.log(instructionList);
// instructions = getInstructions(instructionList);
// console.log(instructions);
// console.log(getOpcodes(instructions));
// console.log(errorList);
// console.log(labelList);


// pgm = "LXI H 5000 MOV A M MOV B A MVI C 09 ADD B DCR C JNZ 5200 INX H ADD M STA 5100 HLT"
// instructionList = pgm.split(' ');
// console.log(pgm);
// console.log(instructionList);
// instructions = getInstructions(instructionList);
// console.log(instructions);
// console.log(getOpcodes(instructions));
// console.log(errorList);
// console.log(labelList);


// pgm = "START: LOOP: END: LOL";
// instructionList = pgm.split(' ');
// getLabels(instructionList);
// console.log(pgm);
// console.log(instructionList);
// instructions = getInstructions(instructionList);
// console.log(instructions);
// console.log(getOpcodes(instructions));
// console.log(errorList);
// console.log(labelList);


// pgm = "START: LXI H 5000 MOV A M MOV B A MVI C 09 LOOP: ADD B DCR C JNZ LOOP INX H ADD M STA 5100 HLT";
// pgm = "   LDA 4000 SUI 30 CPI 0A JC SKIP SUI 07 SKIP: STA 5000 HLT";
// instructionList = pgm.split(' ');
// getLabels(instructionList);
// // console.log(pgm);
// // console.log(instructionList);
// instructions = getInstructions(instructionList);
// getLabelMemoryLocation(instructions);
// console.log(label);
// console.log(instructions);
// byteCodes = getOpcodes(instructions);
// byteCodes = byteCodes.filter(Boolean);
// console.log(byteCodes);
// // console.log(errorList);
// console.log(labelList);