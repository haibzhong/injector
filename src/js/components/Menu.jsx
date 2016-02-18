/* globals chrome: true, ace: true */
import React from 'react'

export default class ContentWrapper extends React.Component {
    render() {
        return (
            <div id="menu">
                <ul>
                    <li onClick={this.handleAddClick}>Add Rule</li>
                    <li onClick={this.handleManageClick}>Manage Rule</li>
                    <li>About</li>
                </ul>
            </div>
        )
    }
    handleAddClick() {
        
    }
    handleManageClick(event) {
        chrome.tabs.create({ url: 'html/manage.html' });
    }
}
