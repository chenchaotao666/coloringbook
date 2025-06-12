import GenerateServiceInstance from '../services/generateService';

/**
 * 通用的图片下载函数
 * @param imageId 图片ID
 * @param format 下载格式 ('png' | 'pdf')
 * @param fileName 可选的文件名，如果不提供会自动生成
 */
export const downloadImageById = async (
  imageId: string, 
  format: 'png' | 'pdf',
  fileName?: string
): Promise<void> => {
  try {
    // 生成文件名
    const finalFileName = fileName || `coloring-page-${imageId}.${format}`;
    
    // 调用API下载图片
    const blob = await GenerateServiceInstance.downloadImage(imageId, format);
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Successfully downloaded ${finalFileName}`);
  } catch (error) {
    console.error('Download failed:', error);
    throw error; // 重新抛出错误，让调用者处理
  }
};