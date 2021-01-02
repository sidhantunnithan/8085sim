const initialState = {
    code: "LDA\t5000\nSTA\t6000\nHLT",
};

export default function editor(state = initialState, action) {
    switch (action.type) {
        case "TEST":
            return state.concat([action.text]);
        default:
            return state;
    }
}
