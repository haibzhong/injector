import '../css/semantic.min.css';
import '../css/popup.scss';
import 'semantic-ui';
import React from 'react';
import ReactDOM from 'react-dom';
import ContentWrapper from './components/ContentWrapper.jsx';

ReactDOM.render(
    <ContentWrapper />,
    document.getElementById('popup')
);
