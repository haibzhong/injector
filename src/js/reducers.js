import _ from 'underscore'
import { combineReducers } from 'redux'
import {
    ADD_RULE,
    DELETE_RULE,
    UPDATE_RULE,
    ENABLE_RULE,
    DISABLE_RULE
} from './actionTypes'

function rules(rules = [], action) {
    switch (action.type) {
        case ADD_RULE:
            return [...rules, action.rule]
        case DELETE_RULE:
            return _.filter(rules, (rule) => rule.id !== action.id)
        case UPDATE_RULE:
            return _.map(rules, (rule) => {
                if (rule.id === action.rule.id) {
                    return action.rule
                } else {
                    return rule;
                }
            })
        default:
            return rules
    }
}

function appliedRules(appliedRules = [], action) {
    switch (action.type) {
        case ENABLE_RULE:
            let exist = _.find(appliedRules, (rule) => {
                return rule.id === action.id
            })
            return exist ? appliedRules : [...appliedRules, action.id]
        case DISABLE_RULE:
            return _.filter(appliedRules, (rule) => rule.id !== action.id)
        default:
            return appliedRules
    }
}

const injectorReducer = combineReducers({
    rules,
    appliedRules
})

export default injectorReducer
