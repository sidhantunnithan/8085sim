// Defining the custom language for Monaco Editor
// with Intel 8085 Micro processor syntax

export const SIM_LANG = {
    defaultToken: "invalid",
    ignoreCase: "true",

    keywords: [
        "ACI",
        "aci",
        "ADC",
        "adc",
        "ADD",
        "add",
        "ADI",
        "adi",
        "ANA",
        "ana",
        "ANI",
        "ani",
        "CALL",
        "call",
        "CC",
        "cc",
        "CM",
        "cm",
        "CMA",
        "cma",
        "CMC",
        "cmc",
        "CMP",
        "cmp",
        "CNC",
        "cnc",
        "CNZ",
        "cnz",
        "CP",
        "cp",
        "CPE",
        "cpe",
        "CPI",
        "cpi",
        "CPO",
        "cpo",
        "CZ",
        "cz",
        "DAA",
        "daa",
        "DAD",
        "dad",
        "DCR",
        "dcr",
        "DCX",
        "dcx",
        "DI",
        "di",
        "EI",
        "ei",
        "HLT",
        "hlt",
        "IN",
        "in",
        "INR",
        "inr",
        "INX",
        "inx",
        "JC",
        "jc",
        "JM",
        "jm",
        "JMP",
        "jmp",
        "JNC",
        "jnc",
        "JNZ",
        "jnz",
        "JP",
        "jp",
        "JPE",
        "jpe",
        "JPO",
        "jpo",
        "JZ",
        "jz",
        "LDA",
        "lda",
        "LDAX",
        "ldax",
        "LHLD",
        "lhld",
        "LXI",
        "lxi",
        "MOV",
        "mov",
        "MVI",
        "mvi",
        "NOP",
        "nop",
        "ORA",
        "ora",
        "ORI",
        "ori",
        "OUT",
        "out",
        "PCHL",
        "pchl",
        "POP",
        "pop",
        "PUSH",
        "push",
        "RAL",
        "ral",
        "RAR",
        "rar",
        "RC",
        "rc",
        "RET",
        "ret",
        "RIM",
        "rim",
        "RLC",
        "rlc",
        "RM",
        "rm",
        "RNC",
        "rnc",
        "RNZ",
        "rnz",
        "RP",
        "rp",
        "RPE",
        "rpe",
        "RPO",
        "rpo",
        "RRC",
        "rrc",
        "RST",
        "rst",
        "RZ",
        "rz",
        "SBB",
        "sbb",
        "SBI",
        "sbi",
        "SHLD",
        "shld",
        "SIM",
        "sim",
        "SPHL",
        "sphl",
        "STA",
        "sta",
        "STAX",
        "stax",
        "STC",
        "stc",
        "SUB",
        "sub",
        "SUI",
        "sui",
        "XCHG",
        "xchg",
        "XRA",
        "xra",
        "XRI",
        "xri",
        "XTHL",
        "xthl",
    ],

    registers: [
        "A",
        "a",
        "B",
        "b",
        "C",
        "c",
        "D",
        "d",
        "E",
        "e",
        "H",
        "h",
        "L",
        "l",
        "M",
        "m",
        "S",
        "s",
        "Z",
        "z",
        "AC",
        "ac",
        "P",
        "p",
        "CY",
        "cy",
    ],

    label: /^[a-zA-Z]*:$/,

    tokenizer: {
        root: [
            { include: "@whitespace" },

            // Keywords
            [
                /[a-zA-Z_][\w_]*('*)/,
                {
                    cases: {
                        "@keywords": "keyword",
                        "@registers": "registers",
                        "@default": "invalid",
                    },
                },
            ],

            // Labels
            [/@label/, "label"],
        ],

        whitespace: [
            [/[ \t\r\n]+/, "white"],
            [/;.*$/, "comment"],
        ],
    },
};

export default SIM_LANG;
