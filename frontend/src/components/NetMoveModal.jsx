import React from "react";
import "./NetMoveModal.css";

// Pop-up shown when the user clicks the "Net Movement" stat card,
// breaking it down into purchases / transfers in / transfers out.
const NetMoveModal = ({ metrics, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Net Movement Breakdown</h2>
        <div className="modal-rows">
          <div className="modal-row">
            <span>Purchases (+):</span>
            <span className="modal-value">{metrics.purchases}</span>
          </div>
          <div className="modal-row">
            <span>Transfers In (+):</span>
            <span className="modal-value modal-value--positive">+{metrics.transfersIn}</span>
          </div>
          <div className="modal-row">
            <span>Transfers Out (-):</span>
            <span className="modal-value modal-value--negative">-{metrics.transfersOut}</span>
          </div>
          <hr className="modal-divider" />
          <div className="modal-row modal-row--total">
            <span>Total Net:</span>
            <span>{metrics.netMovement}</span>
          </div>
        </div>
        <button onClick={onClose} className="modal-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default NetMoveModal;
