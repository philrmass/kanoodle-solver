import React from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from '../styles/App.module.css';

function App() {
  return (
    <div className={styles.page}>
      <Header/>
      <div className={styles.main}>Main</div>
      <Footer/>
    </div>
  );
}

export default App;
