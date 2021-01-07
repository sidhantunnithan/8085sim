export const instructionSet = {
    instruciontSet: {
        ACI: {
            opcode: "CE",
            numBytes: "2",
        },

        "ADC A": {
            opcode: "8F",
            numBytes: "1",
        },

        "ADC B": {
            opcode: "88",
            numBytes: "1",
        },

        "ADC C": {
            opcode: "89",
            numBytes: "1",
        },

        "ADC D": {
            opcode: "8A",
            numBytes: "1",
        },

        "ADC E": {
            opcode: "8B",
            numBytes: "1",
        },

        "ADC H": {
            opcode: "8C",
            numBytes: "1",
        },

        "ADC L": {
            opcode: "8D",
            numBytes: "1",
        },

        "ADC M": {
            opcode: "8E",
            numBytes: "1",
        },

        "ADD A": {
            opcode: "87",
            numBytes: "1",
        },

        "ADD B": {
            opcode: "80",
            numBytes: "1",
        },

        "ADD C": {
            opcode: "81",
            numBytes: "1",
        },

        "ADD D": {
            opcode: "82",
            numBytes: "1",
        },

        "ADD E": {
            opcode: "83",
            numBytes: "1",
        },

        "ADD H": {
            opcode: "84",
            numBytes: "1",
        },

        "ADD L": {
            opcode: "85",
            numBytes: "1",
        },

        "ADD M": {
            opcode: "86",
            numBytes: "1",
        },

        ADI: {
            opcode: "C6",
            numBytes: "2",
        },

        "ANA A": {
            opcode: "A7",
            numBytes: "1",
        },

        "ANA B": {
            opcode: "A0",
            numBytes: "1",
        },

        "ANA C": {
            opcode: "A1",
            numBytes: "1",
        },

        "ANA D": {
            opcode: "A2",
            numBytes: "1",
        },

        "ANA E": {
            opcode: "A3",
            numBytes: "1",
        },

        "ANA H": {
            opcode: "A4",
            numBytes: "1",
        },

        "ANA L": {
            opcode: "A5",
            numBytes: "1",
        },

        "ANA M": {
            opcode: "A6",
            numBytes: "1",
        },

        ANI: {
            opcode: "E6",
            numBytes: "2",
        },

        CALL: {
            opcode: "CD",
            numBytes: "3",
        },

        CC: {
            opcode: "DC",
            numBytes: "3",
        },

        CM: {
            opcode: "FC",
            numBytes: "3",
        },

        CMA: {
            opcode: "2F",
            numBytes: "1",
        },

        CMC: {
            opcode: "3F",
            numBytes: "1",
        },

        "CMP A": {
            opcode: "BF",
            numBytes: "1",
        },

        "CMP B": {
            opcode: "B8",
            numBytes: "1",
        },

        "CMP C": {
            opcode: "B9",
            numBytes: "1",
        },

        "CMP D": {
            opcode: "BA",
            numBytes: "1",
        },

        "CMP E": {
            opcode: "BB",
            numBytes: "1",
        },

        "CMP H": {
            opcode: "BC",
            numBytes: "1",
        },

        "CMP L": {
            opcode: "BD",
            numBytes: "1",
        },

        "CMP M": {
            opcode: "BD",
            numBytes: "1",
        },

        CNC: {
            opcode: "D4",
            numBytes: "3",
        },

        CNZ: {
            opcode: "C4",
            numBytes: "3",
        },

        CP: {
            opcode: "F4",
            numBytes: "3",
        },

        CPE: {
            opcode: "EC",
            numBytes: "3",
        },

        CPI: {
            opcode: "FE",
            numBytes: "2",
        },

        CPO: {
            opcode: "E4",
            numBytes: "3",
        },

        CZ: {
            opcode: "CC",
            numBytes: "3",
        },

        DAA: {
            opcode: "27",
            numBytes: "1",
        },

        "DAD B": {
            opcode: "09",
            numBytes: "1",
        },

        "DAD D": {
            opcode: "19",
            numBytes: "1",
        },

        "DAD H": {
            opcode: "29",
            numBytes: "1",
        },

        "DAD SP": {
            opcode: "39",
            numBytes: "1",
        },

        "DCR A": {
            opcode: "3D",
            numBytes: "1",
        },

        "DCR B": {
            opcode: "05",
            numBytes: "1",
        },

        "DCR C": {
            opcode: "0D",
            numBytes: "1",
        },

        "DCR D": {
            opcode: "15",
            numBytes: "1",
        },

        "DCR E": {
            opcode: "1D",
            numBytes: "1",
        },

        "DCR H": {
            opcode: "25",
            numBytes: "1",
        },

        "DCR L": {
            opcode: "2D",
            numBytes: "1",
        },

        "DCR M": {
            opcode: "35",
            numBytes: "1",
        },

        "DCX B": {
            opcode: "0B",
            numBytes: "1",
        },

        "DCX D": {
            opcode: "1B",
            numBytes: "1",
        },

        "DCX H": {
            opcode: "2B",
            numBytes: "1",
        },

        "DCX SP": {
            opcode: "3B",
            numBytes: "1",
        },

        DI: {
            opcode: "F3",
            numBytes: "1",
        },

        EI: {
            opcode: "FB",
            numBytes: "1",
        },

        HLT: {
            opcode: "76",
            numBytes: "1",
        },

        IN: {
            opcode: "DB",
            numBytes: "2",
        },

        "INR A": {
            opcode: "3C",
            numBytes: "1",
        },

        "INR B": {
            opcode: "04",
            numBytes: "1",
        },

        "INR C": {
            opcode: "0C",
            numBytes: "1",
        },

        "INR D": {
            opcode: "14",
            numBytes: "1",
        },

        "INR E": {
            opcode: "1C",
            numBytes: "1",
        },

        "INR H": {
            opcode: "24",
            numBytes: "1",
        },

        "INR L": {
            opcode: "2C",
            numBytes: "1",
        },

        "INR M": {
            opcode: "34",
            numBytes: "1",
        },

        "INX B": {
            opcode: "03",
            numBytes: "1",
        },

        "INX D": {
            opcode: "13",
            numBytes: "1",
        },

        "INX H": {
            opcode: "23",
            numBytes: "1",
        },

        "INX SP": {
            opcode: "33",
            numBytes: "1",
        },

        JC: {
            opcode: "DA",
            numBytes: "3",
        },

        JM: {
            opcode: "FA",
            numBytes: "3",
        },

        JMP: {
            opcode: "C3",
            numBytes: "3",
        },

        JNC: {
            opcode: "D2",
            numBytes: "3",
        },

        JNZ: {
            opcode: "C2",
            numBytes: "3",
        },

        JP: {
            opcode: "F2",
            numBytes: "3",
        },

        JPE: {
            opcode: "EA",
            numBytes: "3",
        },

        JPO: {
            opcode: "E2",
            numBytes: "3",
        },

        JZ: {
            opcode: "CA",
            numBytes: "3",
        },

        LDA: {
            opcode: "3A",
            numBytes: "3",
        },

        "LDAX B": {
            opcode: "0A",
            numBytes: "1",
        },

        "LDAX D": {
            opcode: "1A",
            numBytes: "1",
        },

        LHLD: {
            opcode: "2A",
            numBytes: "3",
        },

        "LXI B": {
            opcode: "01",
            numBytes: "3",
        },

        "LXI D": {
            opcode: "11",
            numBytes: "3",
        },

        "LXI H": {
            opcode: "21",
            numBytes: "3",
        },

        "LXI SP": {
            opcode: "31",
            numBytes: "3",
        },

        "MOV A A": {
            opcode: "7F",
            numBytes: "1",
        },

        "MOV A B": {
            opcode: "78",
            numBytes: "1",
        },

        "MOV A C": {
            opcode: "79",
            numBytes: "1",
        },

        "MOV A D": {
            opcode: "7A",
            numBytes: "1",
        },

        "MOV A E": {
            opcode: "7B",
            numBytes: "1",
        },

        "MOV A H": {
            opcode: "7C",
            numBytes: "1",
        },

        "MOV A L": {
            opcode: "7D",
            numBytes: "1",
        },

        "MOV A M": {
            opcode: "7E",
            numBytes: "1",
        },

        "MOV B A": {
            opcode: "47",
            numBytes: "1",
        },

        "MOV B B": {
            opcode: "40",
            numBytes: "1",
        },

        "MOV B C": {
            opcode: "41",
            numBytes: "1",
        },

        "MOV B D": {
            opcode: "42",
            numBytes: "1",
        },

        "MOV B E": {
            opcode: "43",
            numBytes: "1",
        },

        "MOV B H": {
            opcode: "44",
            numBytes: "1",
        },

        "MOV B L": {
            opcode: "45",
            numBytes: "1",
        },

        "MOV B M": {
            opcode: "46",
            numBytes: "1",
        },

        "MOV C A": {
            opcode: "4F",
            numBytes: "1",
        },

        "MOV C B": {
            opcode: "48",
            numBytes: "1",
        },

        "MOV C C": {
            opcode: "49",
            numBytes: "1",
        },

        "MOV C D": {
            opcode: "4A",
            numBytes: "1",
        },

        "MOV C E": {
            opcode: "4B",
            numBytes: "1",
        },

        "MOV C H": {
            opcode: "4C",
            numBytes: "1",
        },

        "MOV C L": {
            opcode: "4D",
            numBytes: "1",
        },

        "MOV C M": {
            opcode: "4E",
            numBytes: "1",
        },

        "MOV D A": {
            opcode: "57",
            numBytes: "1",
        },

        "MOV D B": {
            opcode: "50",
            numBytes: "1",
        },

        "MOV D C": {
            opcode: "51",
            numBytes: "1",
        },

        "MOV D D": {
            opcode: "52",
            numBytes: "1",
        },

        "MOV D E": {
            opcode: "53",
            numBytes: "1",
        },

        "MOV D H": {
            opcode: "54",
            numBytes: "1",
        },

        "MOV D L": {
            opcode: "55",
            numBytes: "1",
        },

        "MOV D M": {
            opcode: "56",
            numBytes: "1",
        },

        "MOV E A": {
            opcode: "5F",
            numBytes: "1",
        },

        "MOV E B": {
            opcode: "58",
            numBytes: "1",
        },

        "MOV E C": {
            opcode: "59",
            numBytes: "1",
        },

        "MOV E D": {
            opcode: "5A",
            numBytes: "1",
        },

        "MOV E E": {
            opcode: "5B",
            numBytes: "1",
        },

        "MOV E H": {
            opcode: "5C",
            numBytes: "1",
        },

        "MOV E L": {
            opcode: "5D",
            numBytes: "1",
        },

        "MOV E M": {
            opcode: "5E",
            numBytes: "1",
        },

        "MOV H A": {
            opcode: "67",
            numBytes: "1",
        },

        "MOV H B": {
            opcode: "60",
            numBytes: "1",
        },

        "MOV H C": {
            opcode: "61",
            numBytes: "1",
        },

        "MOV H D": {
            opcode: "62",
            numBytes: "1",
        },

        "MOV H E": {
            opcode: "63",
            numBytes: "1",
        },

        "MOV H H": {
            opcode: "64",
            numBytes: "1",
        },

        "MOV H L": {
            opcode: "65",
            numBytes: "1",
        },

        "MOV H M": {
            opcode: "66",
            numBytes: "1",
        },

        "MOV L A": {
            opcode: "6F",
            numBytes: "1",
        },

        "MOV L B": {
            opcode: "68",
            numBytes: "1",
        },

        "MOV L C": {
            opcode: "69",
            numBytes: "1",
        },

        "MOV L D": {
            opcode: "6A",
            numBytes: "1",
        },

        "MOV L E": {
            opcode: "6B",
            numBytes: "1",
        },

        "MOV L H": {
            opcode: "6C",
            numBytes: "1",
        },

        "MOV L L": {
            opcode: "6D",
            numBytes: "1",
        },

        "MOV L M": {
            opcode: "6E",
            numBytes: "1",
        },

        "MOV M A": {
            opcode: "77",
            numBytes: "1",
        },

        "MOV M B": {
            opcode: "70",
            numBytes: "1",
        },

        "MOV M C": {
            opcode: "71",
            numBytes: "1",
        },

        "MOV M D": {
            opcode: "72",
            numBytes: "1",
        },

        "MOV M E": {
            opcode: "73",
            numBytes: "1",
        },

        "MOV M H": {
            opcode: "74",
            numBytes: "1",
        },

        "MOV M L": {
            opcode: "75",
            numBytes: "1",
        },

        "MVI A": {
            opcode: "3E",
            numBytes: "2",
        },

        "MVI B": {
            opcode: "06",
            numBytes: "2",
        },

        "MVI C": {
            opcode: "0E",
            numBytes: "2",
        },

        "MVI D": {
            opcode: "16",
            numBytes: "2",
        },

        "MVI E": {
            opcode: "1E",
            numBytes: "2",
        },

        "MVI H": {
            opcode: "26",
            numBytes: "2",
        },

        "MVI L": {
            opcode: "2E",
            numBytes: "2",
        },

        "MVI M": {
            opcode: "36",
            numBytes: "2",
        },

        NOP: {
            opcode: "00",
            numBytes: "1",
        },

        "ORA A": {
            opcode: "B7",
            numBytes: "1",
        },

        "ORA B": {
            opcode: "B0",
            numBytes: "1",
        },

        "ORA C": {
            opcode: "B1",
            numBytes: "1",
        },

        "ORA D": {
            opcode: "B2",
            numBytes: "1",
        },

        "ORA E": {
            opcode: "B3",
            numBytes: "1",
        },

        "ORA H": {
            opcode: "B4",
            numBytes: "1",
        },

        "ORA L": {
            opcode: "B5",
            numBytes: "1",
        },

        "ORA M": {
            opcode: "B6",
            numBytes: "1",
        },

        ORI: {
            opcode: "F6",
            numBytes: "2",
        },

        OUT: {
            opcode: "D3",
            numBytes: "2",
        },

        PCHL: {
            opcode: "E9",
            numBytes: "1",
        },

        "POP B": {
            opcode: "C1",
            numBytes: "1",
        },

        "POP D": {
            opcode: "D1",
            numBytes: "1",
        },

        "POP H": {
            opcode: "E1",
            numBytes: "1",
        },

        "POP PSW": {
            opcode: "F1",
            numBytes: "1",
        },

        "PUSH B": {
            opcode: "C5",
            numBytes: "1",
        },

        "PUSH D": {
            opcode: "D5",
            numBytes: "1",
        },

        "PUSH H": {
            opcode: "E5",
            numBytes: "1",
        },

        "PUSH PSW": {
            opcode: "F5",
            numBytes: "1",
        },

        RAL: {
            opcode: "17",
            numBytes: "1",
        },

        RAR: {
            opcode: "1F",
            numBytes: "1",
        },

        RC: {
            opcode: "D8",
            numBytes: "1",
        },

        RET: {
            opcode: "C9",
            numBytes: "1",
        },

        RIM: {
            opcode: "20",
            numBytes: "1",
        },

        RLC: {
            opcode: "07",
            numBytes: "1",
        },

        RM: {
            opcode: "F8",
            numBytes: "1",
        },

        RNC: {
            opcode: "D0",
            numBytes: "1",
        },

        RNZ: {
            opcode: "C0",
            numBytes: "1",
        },

        RP: {
            opcode: "F0",
            numBytes: "1",
        },

        RPE: {
            opcode: "E8",
            numBytes: "1",
        },

        RPO: {
            opcode: "E0",
            numBytes: "1",
        },

        RRC: {
            opcode: "0F",
            numBytes: "1",
        },

        "RST 0": {
            opcode: "C7",
            numBytes: "1",
        },

        "RST 1": {
            opcode: "CF",
            numBytes: "1",
        },

        "RST 2": {
            opcode: "D7",
            numBytes: "1",
        },

        "RST 3": {
            opcode: "DF",
            numBytes: "1",
        },

        "RST 4": {
            opcode: "E7",
            numBytes: "1",
        },

        "RST 5": {
            opcode: "EF",
            numBytes: "1",
        },

        "RST 6": {
            opcode: "F7",
            numBytes: "1",
        },

        "RST 7": {
            opcode: "FF",
            numBytes: "1",
        },

        RZ: {
            opcode: "C8",
            numBytes: "1",
        },

        "SBB A": {
            opcode: "9F",
            numBytes: "1",
        },

        "SBB B": {
            opcode: "98",
            numBytes: "1",
        },

        "SBB C": {
            opcode: "99",
            numBytes: "1",
        },

        "SBB D": {
            opcode: "9A",
            numBytes: "1",
        },

        "SBB E": {
            opcode: "9B",
            numBytes: "1",
        },

        "SBB H": {
            opcode: "9C",
            numBytes: "1",
        },

        "SBB L": {
            opcode: "9D",
            numBytes: "1",
        },

        "SBB M": {
            opcode: "9E",
            numBytes: "1",
        },

        SBI: {
            opcode: "DE",
            numBytes: "2",
        },

        SHLD: {
            opcode: "22",
            numBytes: "3",
        },

        SIM: {
            opcode: "30",
            numBytes: "1",
        },

        SPHL: {
            opcode: "F9",
            numBytes: "1",
        },

        STA: {
            opcode: "32",
            numBytes: "3",
        },

        "STAX B": {
            opcode: "02",
            numBytes: "1",
        },

        "STAX D": {
            opcode: "12",
            numBytes: "1",
        },

        STC: {
            opcode: "37",
            numBytes: "1",
        },

        "SUB A": {
            opcode: "97",
            numBytes: "1",
        },

        "SUB B": {
            opcode: "90",
            numBytes: "1",
        },

        "SUB C": {
            opcode: "91",
            numBytes: "1",
        },

        "SUB D": {
            opcode: "92",
            numBytes: "1",
        },

        "SUB E": {
            opcode: "93",
            numBytes: "1",
        },

        "SUB H": {
            opcode: "94",
            numBytes: "1",
        },

        "SUB L": {
            opcode: "95",
            numBytes: "1",
        },

        "SUB M": {
            opcode: "96",
            numBytes: "1",
        },

        SUI: {
            opcode: "D6",
            numBytes: "2",
        },

        XCHG: {
            opcode: "EB",
            numBytes: "1",
        },

        "XRA A": {
            opcode: "AF",
            numBytes: "1",
        },

        "XRA B": {
            opcode: "A8",
            numBytes: "1",
        },

        "XRA C": {
            opcode: "A9",
            numBytes: "1",
        },

        "XRA D": {
            opcode: "AA",
            numBytes: "1",
        },

        "XRA E": {
            opcode: "AB",
            numBytes: "1",
        },

        "XRA H": {
            opcode: "AC",
            numBytes: "1",
        },

        "XRA L": {
            opcode: "AD",
            numBytes: "1",
        },

        "XRA M": {
            opcode: "AE",
            numBytes: "1",
        },

        XRI: {
            opcode: "EE",
            numBytes: "2",
        },

        XTHL: {
            opcode: "E3",
            numBytes: "1",
        },
    },
};
