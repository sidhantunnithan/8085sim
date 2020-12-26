const fs = require('fs');

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

module.exports = {numBytes, opcode};