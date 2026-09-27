import React from "react";
import Modal from "./Modal";
import Button from "./Button";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  itemType?: string;
  message?: React.ReactNode;
  isLoading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = "item",
  message,
  isLoading = false,
  confirmButtonText,
  cancelButtonText = "Cancel",
}) => {
  const modalTitle =
    title ||
    `Confirm ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Removal`;

  const defaultConfirmText = `Remove ${
    itemType.charAt(0).toUpperCase() + itemType.slice(1)
  }`;
  const actionText = confirmButtonText || defaultConfirmText;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4">
        {message ? (
          typeof message === "string" ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          ) : (
            message
          )
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to remove {itemType}{" "}
            {itemName && (
              <strong className="text-gray-900 dark:text-white">
                {itemName}
              </strong>
            )}
            ?
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelButtonText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : actionText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
