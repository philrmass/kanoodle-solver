import React from 'react';
import PropTypes from 'prop-types';
import Board from './Board';
import styles from '../styles/StepsModal.module.css';

function StepsModal({ steps, close }) {
  function buildBoards() {
    return steps.map((step) => (
      <Board
        key={`${step.board}`}
        board={step.board}
      />
    ));
  }

  return (
    <div className={styles.main}>
      <div className={styles.modal}>
        <div className={styles.content}>
          {buildBoards()}
          <div className={styles.buttonRow}>
            <button onClick={close}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

StepsModal.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.object).isRequired,
  close: PropTypes.func.isRequired,
};

export default StepsModal;
