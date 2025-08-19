import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ItemDetailsModal.css';

const ItemDetailsModal = ({ show, handleClose, item }) => {

    if (!item) {
        return null; // Or render some fallback content or loader
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            onClick={(e) => e.stopPropagation()}
        >
            <Modal.Header closeButton>
                <Modal.Title>Item Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Name:</strong><span className="wrap-text-within ps-1">{item.name}</span></p>
                <p><strong>Condition:</strong> {item.condition}</p>
                <p><strong>Description:</strong><span className="wrap-text-within ps-1">{item.description}</span></p>
                <p><strong>Pickup Location:</strong><span className="wrap-text-within ps-1">{item.pickupLocation}</span></p>
                <div className="d-flex justify-content-center align-items-center">
                    {item.imageUrl ? (
                        <img className="w-100 h-100" src={item.imageUrl} alt={item.name} />
                    ) : (
                        <div>No Image</div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ItemDetailsModal;
