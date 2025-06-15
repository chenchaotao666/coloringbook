
/**
 * 通过URL直接下载图片（推荐方式）
 * @param imageUrl 图片的URL
 * @param fileName 文件名
 */
export const downloadImageByUrl = async (
  imageUrl: string,
  fileName: string
): Promise<void> => {
  try {
    // 直接通过URL下载
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Successfully downloaded ${fileName}`);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * 将图片转换为PDF并下载
 * @param imageUrl 图片的URL
 * @param fileName PDF文件名
 */
export const downloadImageAsPdf = async (
  imageUrl: string,
  fileName: string
): Promise<void> => {
  try {
    // 使用ImageConverter进行PDF转换
    const { ImageConverter } = await import('./imageConverter');
    const pdfBlob = await ImageConverter.convertImageToPdf(imageUrl);
    
    // 创建下载链接
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Successfully downloaded ${fileName}`);
  } catch (error) {
    console.error('PDF conversion failed:', error);
    throw error;
  }
};
