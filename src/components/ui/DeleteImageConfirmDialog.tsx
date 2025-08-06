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
      message={t('messages.confirmDelete')}
      confirmText={isDeleting ? t('status.processing') : t('buttons.delete')}
      cancelText={t('buttons.cancel')}
      confirmButtonVariant="danger"
    />
  );
};

export default DeleteImageConfirmDialog;