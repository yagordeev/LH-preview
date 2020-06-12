import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';


import { createStore } from 'redux';
import allReducers from './reducers';
import { Provider } from 'react-redux';

import App from './App.jsx';

const store = createStore(
	allReducers,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

//get all files from folder for webpack
function requireAll(r) { r.keys().forEach(r) }
requireAll(require.context('../public/img', true, /\.png|jpe?g|gif|svg/));
requireAll(require.context('../public/scss', true, /\.css|scss|sass/));

ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);