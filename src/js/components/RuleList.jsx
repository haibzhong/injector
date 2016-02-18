import React from 'react'

export default class RuleList extends React.Component {

    render() {
        return (
            <div id='ruleList'>
                {
                    this.props.rules.map((rule, index) => {
                        return <div key={index}>{rule}</div>
                    })
                }
            </div>
        )
    }
}
