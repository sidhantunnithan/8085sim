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

function execute(jsonInput)
{
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


    let opcodes = jsonInput["instructions"];
    let start_address = jsonInput["start-instruction"];
    let steps = jsonInput["steps"];
    let genReg = jsonInput["primary-registers"];
    let flagReg = jsonInput["flag-registers"];
    let memory = jsonInput["memory"];

    start_address = parseInt(start_address, 16);    // converting to int
    let memoryIndex = getMemoryIndex(start_address);

    // for(let x=0; x<steps; x++){
    
    // }

}


function getMemoryIndex(address){
    let i = parseInt(address/16);
    let j = parseInt(address%16);

    return [i,j];
}


function lxi(reg, byte3, byte2, genReg){
    switch(reg){
        case 'B':
            genReg['B'] = byte2;
            genReg['C'] = byte3;
            break;

        case 'D':
            genReg['D'] = byte2;
            genReg['E'] = byte3;
            break;

        case 'H':
            genReg['H'] = byte2;
            genReg['L'] = byte3;
            break;

        case "SP":
            genReg["SP"] = byte2 + byte3;
            break;

        default:
            console.log("oh damn!");
    }
    return genReg;
}


function instruction_def(opcode, address, genReg, flagReg, memory){
    let tempAdd;
    let memoryIndex;
    let i;
    let j;
    let reg;
    let byte3;
    let byte2;
    
    switch(opcode){


        // LXI statements
        case "01" :
            // LXI B 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = 'B';
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            genReg = lxi(reg, byte3, byte2, genReg);
            break;

        case "11" :
            // LXI D 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = 'B';
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            genReg = lxi(reg, byte3, byte2, genReg);
            break;
            
        case "21" :
            // LXI H 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = 'B';
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            genReg = lxi(reg, byte3, byte2, genReg);
            break;

        case "31" :
            // LXI SP 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = "SP";
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            genReg = lxi(reg, byte3, byte2, genReg);
            break;

        // MOV statements
        case "7F" :
            // MOV A A
            break;

        case "78" :
            // MOV A B
            genReg["A"] = genReg["B"];
            break;
        
        case "79" :
            // MOV A C
            genReg["A"] = genReg["C"];
            break;

        case "7A" :
            // MOV A D
            genReg["A"] = genReg["D"];
            break;

        case "7B" :
            // MOV A E
            genReg["A"] = genReg["E"];
            break;

        case "7C" :
            // MOV A H
            genReg["A"] = genReg["H"];
            break;

        case "7D" :
            // MOV A L
            genReg["A"] = genReg["L"];
            break;

        case "7E" :
            // MOV A M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["A"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;
    

        case "47" :
            // MOV B A
            genReg["B"] = genReg["A"];
            break;

        case "40" :
            // MOV B B
            break;

        case "41" :
            // MOV B C
            genReg["B"] = genReg["C"];
            break;

        case "42" :
            // MOV B D
            genReg["B"] = genReg["D"];
            break;

        case "43" :
            // MOV B E
            genReg["B"] = genReg["E"];
            break;

        case "44" :
            // MOV B H
            genReg["B"] = genReg["H"];
            break;

        case "45" :
            // MOV B L
            genReg["B"] = genReg["L"];
            break;

        case "46" :
            // MOV B M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["B"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;
    
        case "4F" :
            // MOV C A
            genReg["C"] = genReg["A"];
            break;

        case "48" :
            // MOV C B
            genReg["C"] = genReg["B"];
            break;

        case "49" :
            // MOV C C
            break;

        case "4A" :
            // MOV C D
            genReg["C"] = genReg["D"];
            break;

        case "4B" :
            // MOV C E
            genReg["C"] = genReg["E"];
            break;

        case "4C" :
            // MOV C H
            genReg["C"] = genReg["H"];
            break;

        case "4D" :
            // MOV C L
            genReg["C"] = genReg["L"];
            break;

        case "4E" :
            // MOV C M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["C"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;

        case "57" :
            // MOV D A
            genReg["D"] = genReg["A"];
            break;

        case "50" :
            // MOV D B
            genReg["D"] = genReg["B"];
            break;

        case "51" :
            // MOV D C
            genReg["D"] = genReg["C"];
            break;

        case "52" :
            // MOV D D
            break;

        case "53" :
            // MOV D E
            genReg["D"] = genReg["E"];
            break;

        case "54" :
            // MOV D H
            genReg["D"] = genReg["H"];
            break;

        case "55" :
            // MOV D L
            genReg["D"] = genReg["L"];
            break;

        case "56" :
            // MOV D M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["D"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;

        case "5F" :
            // MOV E A
            genReg["E"] = genReg["A"];
            break;

        case "58" :
            // MOV E B
            genReg["E"] = genReg["B"];
            break;

        case "59" :
            // MOV E C
            genReg["E"] = genReg["C"];
            break;

        case "5A" :
            // MOV E D
            genReg["E"] = genReg["D"];
            break;

        case "5B" :
            // MOV E E
            break;

        case "5C" :
            // MOV E H
            genReg["E"] = genReg["H"];
            break;

        case "5D" :
            // MOV E L
            genReg["E"] = genReg["L"];
            break;

        case "5E" :
            // MOV E M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["E"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;

        case "67" :
            // MOV H A
            genReg["H"] = genReg["A"];
            break;

        case "60" :
            // MOV H B
            genReg["H"] = genReg["B"];
            break;

        case "61" :
            // MOV H C
            genReg["H"] = genReg["C"];
            break;

        case "62" :
            // MOV H D
            genReg["H"] = genReg["D"];
            break;

        case "63" :
            // MOV H E
            genReg["H"] = genReg["E"];
            break;

        case "64" :
            // MOV H H
            break;

        case "65" :
            // MOV H L
            genReg["H"] = genReg["L"];
            break;

        case "66" :
            // MOV H M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["H"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;

        case "6F" :
            // MOV L A
            genReg["L"] = genReg["A"];
            break;

        case "68" :
            // MOV L B
            genReg["L"] = genReg["B"];
            break;

        case "69" :
            // MOV L C
            genReg["L"] = genReg["C"];
            break;

        case "6A" :
            // MOV L D
            genReg["L"] = genReg["D"];
            break;

        case "6B" :
            // MOV L E
            genReg["L"] = genReg["E"];
            break;

        case "6C" :
            // MOV L H
            genReg["L"] = genReg["H"];
            break;

        case "6D" :
            // MOV L L
            break;

        case "6E" :
            // MOV L M
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            genReg["L"] = memory[memoryIndex[0]][memoryIndex[1]];
            break;

        case "77" :
            // MOV M A
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["A"];
            break;

        case "70" :
            // MOV M B
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["B"];
            break;

        case "71" :
            // MOV M C
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["C"];
            break;

        case "72" :
            // MOV M D
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["D"];
            break;

        case "73" :
            // MOV M E
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["E"];
            break;

        case "74" :
            // MOV M H
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["H"];
            break;

        case "75" :
            // MOV M L
            tempAdd = genReg["H"] + genReg["L"];
            memoryIndex = getMemoryIndex(tempAdd);
            memory[memoryIndex[0]][memoryIndex[1]] = genReg["L"];
            break;

        default: console.log(opcode);
    }
}