const {checkInstructionError, parse} = require(__dirname + "/Resources/parse.js")
const { registers, numBytes, opcode, memLoc, label } = require(__dirname + '/Resources/dataStructures.js');

/* 
    The list of instructions are given as input. The input is like 
    ["MOV", "A", "B", "ADD", "B", ...].
    These are to be joined correctly to form proper instructions.
    Returns the instructions in the preferred format, which is like 
    ["MOV A B", "ADD B", ...]
*/

function getInstructions(instructionList){
    let instructions = [];
    let curInstruction = "";
    
    for(var i=0; i<instructionList.length; i++){
        curInstruction += instructionList[i];

        if(curInstruction in opcode){
            if(numBytes[curInstruction] == 1){
                instructions.push(curInstruction);
            }
            else{
                curInstruction += ' ';
                curInstruction += instructionList[i+1];
                i++;
                instructions.push(curInstruction);
            }
            curInstruction = "";
        }
        else{
            curInstruction += ' ';
        }
    }
    return instructions;
}


/* 
    The input will be an array of instructions.
    Returns the opcode of the instructions.
*/
function getOpcodes(instructions){
    
    let opcodeList = [];
    try{
        for(let i=0; i<instructions.length; i++){
            if(checkInstructionError(instructions[i])[0])
                throw("Invalid Instruction: " + instructions[i]);

            let code = parse(instructions[i]);
            // console.log(code);
            opcodeList.push(code);
        }

        return opcodeList;
    }
    catch(err){
        console.log(err);
    }
}

pgm = "LXI H 5000 MOV A M MOV B A MVI C 09 ADD B DCR C JNZ 5200 INX H ADD M STA 5100 HLT"
instructionList = pgm.split(' ');
console.log(pgm);
console.log(instructionList);

// instructionList = ["MOV","A","B","MOV","C","D","ADD","B","ADI","05", "STA","5020"];

instructions = getInstructions(instructionList);

console.log(instructions);
// for(let i=0;i<instructions.length;i++){
//     getOpcodes()
// }
console.log(getOpcodes(instructions));