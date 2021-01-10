import * as actionTypes from "../Actions/types";

// All registers have value 0
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
        PC: "0000",
        SP: "0000",
    },

    flagRegisters: {
        S: "0",
        Z: "0",
        AC: "0",
        P: "0",
        CY: "0",
    },
};

export default function registers(state = initialState, action) {
    switch (action.type) {
        case actionTypes.REGISTER_CHANGE:
            return {
                ...state,
                primaryRegisters: action.payload.primaryRegisters,
                flagRegisters: action.payload.flagRegisters,
            };

        case actionTypes.REGISTER_RESET:
            return {
                primaryRegisters: {
                    A: "00",
                    B: "00",
                    C: "00",
                    D: "00",
                    E: "00",
                    H: "00",
                    L: "00",
                    M: "00",
                    PC: "0000",
                    SP: "0000",
                },
                flagRegisters: {
                    S: "0",
                    Z: "0",
                    AC: "0",
                    P: "0",
                    CY: "0",
                },
            };

        case actionTypes.REGISTER_PC_RESET:
            return {
                ...state,
                primaryRegisters: {
                    ...state.primaryRegisters,
                    PC: "0000",
                },
            };
        default:
            return state;
    }
}
