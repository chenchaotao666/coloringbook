// import { getImageDimensionsFromUrl } from './imageUtils';

/**
 * 图片转换工具类
 * 提供PNG和PDF转换的公共能力
 */
export class ImageConverter {
  
  /**
   * 将图片URL转换为PNG Blob
   * @param imageUrl 图片URL
   * @param highRes 是否使用高分辨率（3倍分辨率）
   * @returns PNG Blob
   */
  static async convertImageToPng(imageUrl: string, highRes: boolean = false): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 处理跨域问题
      
      img.onload = () => {
        // 为PDF生成高分辨率版本（3倍分辨率）
        const scale = highRes ? 3 : 1;
        const width = img.width * scale;
        const height = img.height * scale;
        
        canvas.width = width;
        canvas.height = height;
        
        // 设置高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 设置白色背景
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制高分辨率图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为PNG Blob，使用最高质量
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to PNG'));
          }
        }, 'image/png', 1.0); // 使用最高质量
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * 将图片URL转换为PDF Blob（保持原始比例）
   * @param imageUrl 图片URL
   * @returns PDF Blob
   */
  static async convertImageToPdf(imageUrl: string): Promise<Blob> {
    // 动态导入jsPDF
    const { jsPDF } = await import('jspdf');
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 处理跨域问题
      
      img.onload = async () => {
        try {
          // 获取图片的原始尺寸
          const imgWidth = img.naturalWidth || img.width;
          const imgHeight = img.naturalHeight || img.height;
          
          // 判断是否需要转换为PNG
          let base64: string;
          const isPng = imageUrl.toLowerCase().includes('.png') || imageUrl.toLowerCase().includes('image/png');
          
          if (isPng) {
            // 如果已经是PNG，直接获取base64
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            // 使用3倍分辨率提高PDF质量
            const scale = 3;
            canvas.width = imgWidth * scale;
            canvas.height = imgHeight * scale;
            
            // 设置高质量渲染
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 设置白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制高分辨率图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // 转换为base64
            base64 = canvas.toDataURL('image/png', 1.0).split(',')[1];
          } else {
            // 如果不是PNG，使用convertImageToPng方法
            const pngBlob = await ImageConverter.convertImageToPng(imageUrl, true);
            base64 = await ImageConverter.blobToBase64(pngBlob);
          }
          
          // 计算图片在PDF中的实际尺寸（以毫米为单位）
          // 使用72 DPI作为基准，这样图片会以接近原始像素大小显示
          const baseDpi = 72;
          const mmPerInch = 25.4;
          const pxToMm = mmPerInch / baseDpi;
          
          // 使用原始图片尺寸
          const imageWidthMm = imgWidth * pxToMm;
          const imageHeightMm = imgHeight * pxToMm;
          
          // 设置PDF页面尺寸，与图片尺寸完全匹配
          const pageWidth = imageWidthMm;
          const pageHeight = imageHeightMm;
          
          // 根据实际比例确定方向
          const orientation = imageWidthMm > imageHeightMm ? 'landscape' : 'portrait';
          
          // 创建PDF
          const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [pageWidth, pageHeight],
            compress: false // 不压缩以保持质量
          });
          
          // 图片从左上角开始，填满整个页面
          const imageX = 0;
          const imageY = 0;
          
          // 添加高分辨率图片到PDF，填满页面
          pdf.addImage(
            `data:image/png;base64,${base64}`,
            'PNG',
            imageX,
            imageY,
            imageWidthMm,
            imageHeightMm,
            undefined,
            'FAST' // 使用快速但高质量的压缩
          );
          
          // 返回PDF Blob
          const pdfBlob = pdf.output('blob');
          resolve(pdfBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for PDF conversion'));
      };
      
      img.src = imageUrl;
    });
  }



  /**
   * 将Blob转换为base64
   * @param blob Blob对象
   * @returns base64字符串
   */
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // 移除data:image/png;base64,前缀
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
} 