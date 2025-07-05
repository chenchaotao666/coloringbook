import { ApiUtils, ApiError } from '../utils/apiUtils';

// PayPal订单创建请求接口
export interface CreateOrderRequest {
  method: 'paypal';
  planCode: 'FREE' | 'LITE' | 'PRO';
  chargeType: 'Monthly' | 'Yearly';
}

// PayPal订单创建响应接口
export interface CreateOrderResponse {
  orderId: string;
  amount: number;
}

// PayPal订单捕获请求接口
export interface CaptureOrderRequest {
  orderID: string;
}

// PayPal订单捕获响应接口
export interface CaptureOrderResponse {
  success: boolean;
  message?: string;
}

/**
 * 定价和支付服务类
 */
export class PricingService {
  /**
   * 创建PayPal支付订单
   */
  static async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await ApiUtils.post<CreateOrderResponse>('/api/payment/order', data, true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1020', '创建支付订单失败');
    }
  }

  /**
   * 捕获PayPal支付订单
   */
  static async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    try {
      const response = await ApiUtils.post<CaptureOrderResponse>(`/api/payment/capture/${orderId}`, {}, true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1021', '捕获支付订单失败');
    }
  }
}

// 导出默认实例
export const pricingService = new PricingService();
