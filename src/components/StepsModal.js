import React from 'react';
import PropTypes from 'prop-types';
//import Board from './Board';
import styles from '../styles/StepsModal.module.css';

function StepsModal({ steps, close }) {
  return (
    <div className={styles.main}>
      <div className={styles.modal}>
        <div className={styles.content}>
          {`Steps ${steps.length} steps`}
          {/*
          <Board
            board={steps[0].board}
          />
          */}
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
