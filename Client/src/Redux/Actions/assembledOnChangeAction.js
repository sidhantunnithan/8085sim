import * as actionTypes from "./types";

export const stepLabelForward = (payloadLocal) => (dispatch, getState) => {
    // Push to stack
    var stateStackCopy = getState().stackReducer.stateStack;

    stateStackCopy.push({
        primaryRegisters: getState().registerReducer.primaryRegisters,
        flagRegisters: getState().registerReducer.flagRegisters,
        memory: getState().memoryReducer.memory,
    });

    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stateStackCopy,
    });

    // Highlight the instruction we just executed
    const opCodes = getState().memoryReducer.opCodes;
    const instructions = getState().memoryReducer.instructions;
    let opCodeIndexToShow = 0;

    if (payloadLocal.executedOpCodeIndex !== undefined) {
        // We know which instruction we just executed
        opCodeIndexToShow = payloadLocal.executedOpCodeIndex;
    } else {
        // Fallback: find the opCode that was just executed (ends just before current PC)
        let pc = parseInt(payloadLocal.primaryRegisters.PC, 16);
        let currentAddress = 0;
        for (let i = 0; i < opCodes.length; i++) {
            let nextAddress = currentAddress + opCodes[i].length;
            // Check if current instruction ends at or just before PC
            if (nextAddress <= pc) {
                opCodeIndexToShow = i;
            } else {
                break;
            }
            currentAddress = nextAddress;
        }
    }

    // Map opCode index to UI index in full instructions array (which includes labels)
    let instructionIndex = -1;
    let opCodeCount = 0;

    for (let i = 0; i < instructions.length; i++) {
        if (!instructions[i].endsWith(":")) {
            // This is a real instruction, not a label
            if (opCodeCount === opCodeIndexToShow) {
                // Check if there's a label immediately before this instruction
                if (i > 0 && instructions[i - 1].endsWith(":")) {
                    // Highlight the label row instead (labels and their instructions share a row)
                    instructionIndex = i - 1;
                } else {
                    instructionIndex = i;
                }
                break;
            }
            opCodeCount++;
        }
    }

    // Only dispatch if we found a valid instruction index
    if (instructionIndex >= -1) {
        dispatch({
            type: actionTypes.STEP_LABEL,
            payload: instructionIndex,
        });
    }

    if (payloadLocal.final === false) {
        dispatch({
            type: actionTypes.REGISTER_CHANGE,
            payload: {
                primaryRegisters: payloadLocal.primaryRegisters,
                flagRegisters: payloadLocal.flagRegisters,
            },
        });

        var loadedMemoryLocal = new Map();
        payloadLocal.memory.forEach((rValue, rIndex) => {
            rValue.forEach((cValue, cIndex) => {
                if (parseInt(cValue, 16) > 0) {
                    var key = (
                        "0000" +
                        rIndex.toString(16).toUpperCase() +
                        cIndex.toString(16).toUpperCase()
                    ).slice(-4);
                    loadedMemoryLocal.set(key, cValue);
                }
            });
        });

        dispatch({
            type: actionTypes.MEMORY_UPDATE,
            payload: {
                memory: payloadLocal.memory,
                loadedMemory: loadedMemoryLocal,
            },
        });
    }
};

export const onRun = (payloadLocal) => (dispatch, getState) => {
    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: -1,
    });

    dispatch({
        type: actionTypes.REGISTER_CHANGE,
        payload: {
            primaryRegisters: payloadLocal.primaryRegisters,
            flagRegisters: payloadLocal.flagRegisters,
        },
    });

    var loadedMemoryLocal = new Map();
    payloadLocal.memory.forEach((rValue, rIndex) => {
        rValue.forEach((cValue, cIndex) => {
            if (parseInt(cValue, 16) > 0) {
                var key = (
                    "0000" +
                    rIndex.toString(16).toUpperCase() +
                    cIndex.toString(16).toUpperCase()
                ).slice(-4);
                loadedMemoryLocal.set(key, cValue);
            }
        });
    });

    dispatch({
        type: actionTypes.MEMORY_UPDATE,
        payload: {
            memory: payloadLocal.memory,
            loadedMemory: loadedMemoryLocal,
        },
    });
};

export const stepLabelBackward = () => (dispatch, getState) => {
    const instructions = getState().memoryReducer.instructions;
    let currentIndex = getState().assembledReducer.labelIndex;
    let newIndex = currentIndex - 1;

    // Skip backward over labels
    while (newIndex >= 0 && instructions[newIndex].endsWith(":")) {
        newIndex--;
    }

    dispatch({
        type: actionTypes.STEP_LABEL,
        payload: newIndex,
    });

    var stateStackCopy = getState().stackReducer.stateStack;
    var pastStack = stateStackCopy.pop();

    dispatch({
        type: actionTypes.REGISTER_CHANGE,
        payload: {
            primaryRegisters: pastStack.primaryRegisters,
            flagRegisters: pastStack.flagRegisters,
        },
    });

    var loadedMemoryLocal = new Map();
    pastStack.memory.forEach((rValue, rIndex) => {
        rValue.forEach((cValue, cIndex) => {
            if (parseInt(cValue, 16) > 0) {
                var key = (
                    "0000" +
                    rIndex.toString(16).toUpperCase() +
                    cIndex.toString(16).toUpperCase()
                ).slice(-4);
                loadedMemoryLocal.set(key, cValue);
            }
        });
    });

    dispatch({
        type: actionTypes.MEMORY_UPDATE,
        payload: {
            memory: pastStack.memory,
            loadedMemory: loadedMemoryLocal,
        },
    });

    dispatch({
        type: actionTypes.STATE_STACK_CHANGE,
        payload: stateStackCopy,
    });
};
