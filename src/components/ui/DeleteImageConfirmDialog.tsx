import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface DeleteImageConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteImageConfirmDialog: React.FC<DeleteImageConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  const { t } = useAsyncTranslation('common');

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      message={t('messages.confirmDelete', 'Are you sure you want to delete this image? This action cannot be undone.')}
      confirmText={isDeleting ? t('status.processing', 'Deleting...') : t('buttons.delete', 'Delete')}
      cancelText={t('buttons.cancel', 'Cancel')}
      confirmButtonVariant="danger"
    />
  );
};

export default DeleteImageConfirmDialog;