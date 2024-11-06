import React, { useRef, useEffect } from 'react';
// import './styles.css';

const DialogComponent = ({ isVisible, title, content, onClose, closeDialog }) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isVisible && dialogRef.current) {
            dialogRef.current.showModal();
        } else if (dialogRef.current) {
            dialogRef.current.close();
        }
    }, [isVisible]);

    const handleClickOutside = (e) => {
        // Close dialog if click is outside the dialog
        if (e.target === dialogRef.current) {
            handleClose();
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        if (closeDialog) closeDialog();
    };

    return (
        <>
            {isVisible && (
                <div className={`dialog-backdrop ${isVisible ? 'show' : ''}`} onClick={handleClickOutside}>
                    <dialog ref={dialogRef} className={isVisible ? 'show' : ''} onClick={(e) => e.stopPropagation()}>
                        <div className="dialog-header">
                            <h2>{title}</h2>
                        </div>
                        <div className="dialog-content">
                            {content}
                        </div>
                        <div className="dialog-footer">
                            <button className="dialog-confirm-btn" onClick={handleClose}>确定</button>
                        </div>
                    </dialog>
                </div>
            )}
        </>
    );
};

export default DialogComponent;
