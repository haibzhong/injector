import {
    ADD_RULE,
    DELETE_RULE,
    UPDATE_RULE,
    ENABLE_RULE,
    DISABLE_RULE
} from './actionTypes';

export function addRule(rule) {
    return {
        type: ADD_RULE,
        rule
    };
}

export function deleteRule(id) {
    return {
        type: DELETE_RULE,
        id
    };
}

export function updateRule(id, rule) {
    return {
        type: UPDATE_RULE,
        id,
        rule
    };
}

export function enableRule(id) {
    return {
        type: ENABLE_RULE,
        id
    };
}

export function disableRule(id) {
    return {
        type: DISABLE_RULE,
        id
    };
}
