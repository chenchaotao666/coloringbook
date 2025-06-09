import { mockApiService } from '../services/generateService';

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
    const blob = await mockApiService.downloadImage(imageId, format);
    
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

/**
 * 为GeneratePage使用的下载函数
 * @param selectedImage 选中的图片URL
 * @param generatedImages 生成的图片列表
 * @param format 下载格式
 */
export const downloadSelectedImage = async (
  selectedImage: string | null,
  generatedImages: any[],
  format: 'png' | 'pdf'
): Promise<void> => {
  if (!selectedImage) return;
  
  // 找到选中图片的ID - 现在selectedImage存储的是默认图片URL
  const selectedImageData = generatedImages.find(img => img.url === selectedImage);
  if (selectedImageData) {
    const fileName = `coloring-page-${selectedImageData.ratio}-${selectedImageData.id.slice(-8)}.${format}`;
    await downloadImageById(selectedImageData.id, format, fileName);
  }
}; 