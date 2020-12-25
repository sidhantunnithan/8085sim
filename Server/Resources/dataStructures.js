const fs = require('fs');

// contains register values in hex
var  registers = {
    'A' : '00',
    'B' : '00',
    'C' : '00',
    'D' : '00',
    'E' : '00',
    'H' : '00',
    'L' : '00'
};  

// contains label -> memory location
var label = {};

// contains mnemonic -> number of bytes
var numBytes = {};

// contains mnemonic -> opcode
var opcode = {};


const data = fs.readFileSync(__dirname + '/instructions.json', 
              {encoding:'utf8', flag:'r'}); 

const instructions = JSON.parse(data);

Object.entries(instructions).forEach(([key, value]) => {
    numBytes[key] = value.numBytes;
    opcode[key] = value.opcode;
})

module.exports = {registers, numBytes, opcode};