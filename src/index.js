import React from 'react';
import ReactDOM from 'react-dom';
import './styles/normalize.css';
import './index.css';
import App from './components/App';
import { registerServiceWorker } from './utilities/serviceWorker';

ReactDOM.render(<App/>, document.getElementById('app'));

module.hot.accept();

registerServiceWorker();
