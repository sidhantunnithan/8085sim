const {checkInstructionError, parse} = require(__dirname + "/../../Resources/parse.js")
const { registers, numBytes, opcode, memLoc, label } = require(__dirname + '/../../Resources/dataStructures.js');

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
            if(checkInstructionError(instructions[i]))
                throw("Invalid Instruction: " + instructions[i]);

            let code = parse(instructions[i]);
            for(let j; j<code.length; j++){
                opcodeList.push(code[j]);
            }
        }

        return opcodeList;
    }
    catch(err){
        console.log(err);
    }
}

// instructionList = ["MOV","A","B","MOV","C","D","ADD","B","ADI","05", "STA","5020"];

// instructions = getInstructions(instructionList);

// for(let i=0;i<instructions.length;i++){
//     console.log(parse(instructions[i]));
// }
