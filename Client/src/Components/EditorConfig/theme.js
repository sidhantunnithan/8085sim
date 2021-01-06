// Defining the theme with custom syntax highlighting
// for the Intel 8085 Microprocessor instruction set

export const SIM_THEME = {
    base: "vs-dark", // can also be vs-dark or hc-black
    inherit: false, // can also be false to completely replace the builtin rules
    rules: [
        { token: "invalid", foreground: "ffffff" },
        { token: "keyword", foreground: "569cd6" },
        { token: "registers", foreground: "ce9178" },
        { token: "comment", foreground: "808080" },
        { token: "label", foreground: "00FF00" },
    ],
    colors: {
        "editor.background": "#1f2227",
        "editorCursor.foreground": "#586677",
        "editor.selectionBackground": "#153840",
    },
};

export default SIM_THEME;
