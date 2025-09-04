import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
// import { bootstrapAuth } from './redux/slices/authSlice'
import { store } from './redux/store';

// store.dispatch(bootstrapAuth());
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
