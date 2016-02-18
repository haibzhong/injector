import '../css/manage.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import injectorReducer from './reducers'
import Storage from './Storage'
import Manage from './components/Manage.jsx'

const storage = new Storage();
const persistStore = store => next => action => {
    storage.setStore(store);
    let result = next(action)
    return result
}

let createStoreWithMiddleware = applyMiddleware(persistStore)(createStore);
let store = createStoreWithMiddleware(injectorReducer)

ReactDOM.render(
    <Provider store={ store }>
        <Manage />
    </Provider>, document.getElementById('manage')
);
