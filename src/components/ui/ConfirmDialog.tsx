import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message = 'Are you sure you want to delete this item?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmButtonVariant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black opacity-70"></div>
      
      {/* 对话框 */}
      <div className="relative bg-white rounded-2xl border border-[#EDEEF0] w-[490px] h-[190px] flex flex-col">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-4 h-4 flex items-center justify-center hover:opacity-70 transition-opacity"
        >
          <img src="/images/close-x.svg" alt="Close" className="w-4 h-4" />
        </button>

        {/* 内容区域 */}
        <div className="flex-1 flex flex-col justify-center px-8">
          {/* 图标和标题 */}
          <div className="flex items-center mb-4">
            {/* 警告图标 */}
            <div className="w-6 h-6 mr-4 flex items-center justify-center">
              <img src="/images/notice.svg" alt="Notice" className="w-6 h-6" />
            </div>
            
            {/* 消息文本 */}
            <div className="text-[#161616] text-base font-medium">
              {message}
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex justify-end gap-4 px-8 pb-8">
          {/* 取消按钮 */}
          <button
            onClick={onClose}
            className="w-[120px] h-12 border border-[#A5A5A5] rounded-lg text-[#161616] text-lg font-bold hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          
          {/* 确认按钮 */}
          <button
            onClick={handleConfirm}
            className={`w-[120px] h-12 rounded-lg text-white text-lg font-bold transition-colors ${
              confirmButtonVariant === 'danger' 
                ? 'bg-gradient-to-r from-[#FF9D00] to-[#FF5907] hover:from-[#FF8A00] hover:to-[#FF4500]'
                : 'bg-gradient-to-r from-[#FF9D00] to-[#FF5907] hover:from-[#FF8A00] hover:to-[#FF4500]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 