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
}


function instruction_def(opcode, address, genReg, flagReg, memory){
    switch(opcode){


        // LXI statements
        case "01" :
            // LXI B 16bit_data
            let memoryIndex = getMemoryIndex(address);
            let i = memoryIndex[0];
            let j = memoryIndex[1];
            let reg = 'B';
            let byte3 = memory[i + (j+1)/16][(j+1)%16];
            let byte2 = memory[i + (j+2)/16][(j+2)%16];

            lxi(reg, byte3, byte2, genReg);
            break;

        case "11" :
            // LXI D 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = 'B';
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            lxi(reg, byte3, byte2, genReg);
            break;
            
        case "21" :
            // LXI H 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = 'B';
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            lxi(reg, byte3, byte2, genReg);
            break;

        case "31" :
            // LXI SP 16bit_data
            memoryIndex = getMemoryIndex(address);
            i = memoryIndex[0];
            j = memoryIndex[1];
            reg = "SP";
            byte3 = memory[i + (j+1)/16][(j+1)%16];
            byte2 = memory[i + (j+2)/16][(j+2)%16];

            lxi(reg, byte3, byte2, genReg);
            break;


        default: console.log(opcode);
    }
}