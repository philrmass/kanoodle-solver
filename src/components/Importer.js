import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Importer.module.css';

function Importer() {
  return (
    <div className={styles.main}>Importer</div>
  );
}

Importer.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  saveLevel: PropTypes.func.isRequired,
};

export default Importer;
