const initialState = {
    primaryRegisters: {
        A: "00",
        B: "00",
        C: "00",
        D: "00",
        E: "00",
        H: "00",
        L: "00",
        M: "00",
    },

    flagRegisters: {
        S: "00",
        Z: "00",
        AC: "00",
        P: "00",
        CY: "00",
    },
};

export default function registers(state = initialState, action) {
    switch (action.type) {
        case "TEST":
            return state.concat([action.text]);
        default:
            return state;
    }
}
