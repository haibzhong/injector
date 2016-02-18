import '../css/popup.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import injectorReducer from './reducers'
import Menu from './components/Menu.jsx'


let store = createStore(injectorReducer)

ReactDOM.render(
    <Provider store={ store }>
        <Menu />
    </Provider>, document.getElementById('popup')
);
