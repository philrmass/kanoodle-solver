import React from 'react';
import Board from './Board';
import Header from './Header';
import styles from '../styles/App.module.css';

function App() {
  return (
    <div className={styles.page}>
      <Header/>
      <main className={styles.main}>
        <Board/>
      </main>
    </div>
  );
}

export default App;
