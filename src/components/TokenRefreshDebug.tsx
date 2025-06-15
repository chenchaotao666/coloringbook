import React, { useState, useEffect } from 'react';
import { tokenRefreshService } from '../services/tokenRefreshService';
import { ApiUtils } from '../utils/apiUtils';

interface TokenRefreshDebugProps {
  className?: string;
}

export const TokenRefreshDebug: React.FC<TokenRefreshDebugProps> = ({ className = '' }) => {
  const [refreshStatus, setRefreshStatus] = useState(tokenRefreshService.getRefreshStatus());
  const [tokenInfo, setTokenInfo] = useState<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    accessTokenPreview: string;
  }>({
    hasAccessToken: false,
    hasRefreshToken: false,
    accessTokenPreview: ''
  });

  // 更新状态
  const updateStatus = () => {
    setRefreshStatus(tokenRefreshService.getRefreshStatus());
    
    const accessToken = ApiUtils.getAccessToken();
    const refreshToken = ApiUtils.getRefreshToken();
    
    setTokenInfo({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : ''
    });
  };

  // 定期更新状态
  useEffect(() => {
    updateStatus();
    
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // 监听token刷新事件
  useEffect(() => {
    const handleTokenRefreshed = () => {
      updateStatus();
    };

    const handleTokenExpired = () => {
      updateStatus();
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const handleManualRefresh = async () => {
    await tokenRefreshService.manualRefresh();
    updateStatus();
  };

  const handleStartService = () => {
    tokenRefreshService.start();
    updateStatus();
  };

  const handleStopService = () => {
    tokenRefreshService.stop();
    updateStatus();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '未设置';
    return date.toLocaleTimeString('zh-CN');
  };

  const getStatusColor = (isRunning: boolean, isRefreshing: boolean) => {
    if (isRefreshing) return 'text-yellow-600';
    if (isRunning) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusText = (isRunning: boolean, isRefreshing: boolean) => {
    if (isRefreshing) return '刷新中...';
    if (isRunning) return '运行中';
    return '已停止';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Token自动刷新调试</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          refreshStatus.isRefreshing 
            ? 'bg-yellow-100 text-yellow-800' 
            : refreshStatus.isRunning 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
        }`}>
          {getStatusText(refreshStatus.isRunning, refreshStatus.isRefreshing)}
        </div>
      </div>

      {/* 服务状态 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">服务状态</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>运行状态:</span>
              <span className={getStatusColor(refreshStatus.isRunning, refreshStatus.isRefreshing)}>
                {getStatusText(refreshStatus.isRunning, refreshStatus.isRefreshing)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>下次刷新:</span>
              <span className="text-gray-600">
                {formatTime(refreshStatus.nextRefreshTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Token状态</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>访问令牌:</span>
              <span className={tokenInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                {tokenInfo.hasAccessToken ? '存在' : '不存在'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>刷新令牌:</span>
              <span className={tokenInfo.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                {tokenInfo.hasRefreshToken ? '存在' : '不存在'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Token预览 */}
      {tokenInfo.hasAccessToken && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2">访问令牌预览</h4>
          <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-600 break-all">
            {tokenInfo.accessTokenPreview}
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleManualRefresh}
          disabled={refreshStatus.isRefreshing || !tokenInfo.hasRefreshToken}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          {refreshStatus.isRefreshing ? '刷新中...' : '手动刷新'}
        </button>

        {!refreshStatus.isRunning ? (
          <button
            onClick={handleStartService}
            disabled={!tokenInfo.hasAccessToken}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            启动服务
          </button>
        ) : (
          <button
            onClick={handleStopService}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            停止服务
          </button>
        )}

        <button
          onClick={updateStatus}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          刷新状态
        </button>
      </div>

      {/* 说明信息 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 服务每10分钟自动检查并刷新访问令牌</li>
          <li>• 当令牌剩余有效时间少于2分钟时会自动刷新</li>
          <li>• 用户登录时自动启动服务，登出时自动停止</li>
          <li>• 刷新失败时会触发token过期事件</li>
        </ul>
      </div>
    </div>
  );
}; 