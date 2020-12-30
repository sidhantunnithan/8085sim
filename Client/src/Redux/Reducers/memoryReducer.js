const initialState = {
    memory: new Array(4095).fill(0).map((i) => {
        return new Array(16).fill(0);
    }),
};

export default function memory(state = initialState, action) {
    switch (action.type) {
        case "TEST":
            return state.concat([action.text]);
        default:
            return state;
    }
}
