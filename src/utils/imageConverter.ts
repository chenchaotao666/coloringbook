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
    
    // 先获取原始图片尺寸
    const originalImageDimensions = await ImageConverter.getOriginalImageDimensions(imageUrl);
    
    // 先转换为高分辨率PNG（3倍分辨率）
    const pngBlob = await ImageConverter.convertImageToPng(imageUrl, true);
    const base64 = await ImageConverter.blobToBase64(pngBlob);
    
    // 计算图片在PDF中的实际尺寸（以毫米为单位）
    // 使用72 DPI作为基准，这样图片会以接近原始像素大小显示
    const baseDpi = 72;
    const mmPerInch = 25.4;
    const pxToMm = mmPerInch / baseDpi;
    
    // 使用原始图片尺寸而不是固定的ratio尺寸
    const imageWidthMm = originalImageDimensions.width * pxToMm;
    const imageHeightMm = originalImageDimensions.height * pxToMm;
    
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
    return pdfBlob;
  }

  /**
   * 将SVG文本转换为PNG Blob
   * @param svgText SVG文本内容
   * @param ratio 图片比例
   * @param highRes 是否使用高分辨率
   * @returns PNG Blob
   */
  static async convertSvgToPng(svgText: string, ratio: string, highRes: boolean = false): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // 创建一个canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // 根据比例设置canvas尺寸
      const dimensions = ImageConverter.getImageDimensions(ratio);
      
      // 为PDF生成高分辨率版本（3倍分辨率）
      const scale = highRes ? 3 : 1;
      const width = dimensions.fullSize.width * scale;
      const height = dimensions.fullSize.height * scale;
      
      canvas.width = width;
      canvas.height = height;
      
      // 设置高质量渲染
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 创建一个Image对象
      const img = new Image();
      
      img.onload = () => {
        // 清理URL
        URL.revokeObjectURL(url);
        
        // 设置白色背景
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制SVG图片（高分辨率）
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
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      
      // 创建SVG的data URL
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    });
  }

  /**
   * 将SVG文本转换为PDF Blob
   * @param svgText SVG文本内容
   * @param ratio 图片比例
   * @returns PDF Blob
   */
  static async convertSvgToPdf(svgText: string, ratio: string): Promise<Blob> {
    // 动态导入jsPDF
    const { jsPDF } = await import('jspdf');
    
    // 先转换为高分辨率PNG
    const pngBlob = await ImageConverter.convertSvgToPng(svgText, ratio, true);
    const base64 = await ImageConverter.blobToBase64(pngBlob);
    
    // 获取图片尺寸
    const dimensions = ImageConverter.getImageDimensions(ratio);
    
    // 计算图片在PDF中的实际尺寸（以毫米为单位）
    // 使用72 DPI作为基准，这样图片会以接近原始像素大小显示
    const baseDpi = 72;
    const mmPerInch = 25.4;
    const pxToMm = mmPerInch / baseDpi;
    
    const imageWidthMm = dimensions.fullSize.width * pxToMm;
    const imageHeightMm = dimensions.fullSize.height * pxToMm;
    
    // 设置PDF页面尺寸，与图片尺寸完全匹配
    const pageWidth = imageWidthMm;
    const pageHeight = imageHeightMm;
    
    // 创建PDF
    const pdf = new jsPDF({
      orientation: ratio === '4:3' ? 'landscape' : 'portrait',
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
    return pdfBlob;
  }

  /**
   * 获取原始图片尺寸
   * @param imageUrl 图片URL
   * @returns 图片尺寸
   */
  static async getOriginalImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension calculation'));
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

  /**
   * 根据比例获取图片尺寸
   * @param ratio 图片比例
   * @returns 图片尺寸信息
   */
  static getImageDimensions(ratio: string) {
    switch (ratio) {
      case '3:4':
        return {
          thumbnail: { width: 90, height: 120 },
          fullSize: { width: 345, height: 460 },
        };
      case '4:3':
        return {
          thumbnail: { width: 110, height: 82 },
          fullSize: { width: 613, height: 460 },
        };
      case '1:1':
        return {
          thumbnail: { width: 90, height: 90 },
          fullSize: { width: 460, height: 460 },
        };
      default:
        return {
          thumbnail: { width: 90, height: 120 },
          fullSize: { width: 345, height: 460 },
        };
    }
  }
} 