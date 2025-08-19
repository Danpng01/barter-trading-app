import React from 'react';
import './TransactionComp.css';

function TransactionComp({ value }) {
    return (
      <div className="transaction-container">
        <h2>Number of transactions completed:</h2>
        <p>{value}</p>
      </div>
    );
}

export default TransactionComp;
