import React from 'react'
import { connect } from 'react-redux'
import RuleList from './RuleList.jsx'
import { addRule } from '../actionCreator'

export default class Manage extends React.Component {
    render() {
        const { dispatch } = this.props;
        return (
            <div>
                <button onClick={() => dispatch(addRule(~~(Math.random()*1000)))}>Add Rule</button>
                <RuleList {...this.props} />
            </div>
        )
    }
}

function init(state) {
  return state
}

export default connect(init)(Manage)
