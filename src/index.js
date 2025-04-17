import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "./styles/main.scss";
import App from './App';

// Add theme transition class on initial load
document.documentElement.classList.add('theme-transition');
document.addEventListener('DOMContentLoaded', () => {
  // Remove transition class once loaded
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('theme-transition');
  });
});

// Handle theme transitions
let timeoutId;
const handleThemeChange = () => {
  document.documentElement.classList.add('theme-transition');
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 300); // Match this with CSS transition duration
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-theme') {
      handleThemeChange();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

