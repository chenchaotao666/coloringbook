// 简单的token刷新功能测试脚本
// 在浏览器控制台中运行此脚本来测试功能

console.log('🧪 开始测试Token自动刷新功能...');

// 检查服务是否可用
if (typeof window !== 'undefined' && window.tokenRefreshService) {
  const service = window.tokenRefreshService;
  
  console.log('✅ Token刷新服务已加载');
  
  // 获取当前状态
  const status = service.getRefreshStatus();
  console.log('📊 当前状态:', status);
  
  // 测试手动刷新
  console.log('🔄 测试手动刷新...');
  service.manualRefresh().then(success => {
    console.log(success ? '✅ 手动刷新成功' : '❌ 手动刷新失败');
  });
  
  // 测试启动服务
  console.log('🚀 启动自动刷新服务...');
  service.start();
  
  // 5秒后检查状态
  setTimeout(() => {
    const newStatus = service.getRefreshStatus();
    console.log('📊 5秒后状态:', newStatus);
  }, 5000);
  
} else {
  console.log('❌ Token刷新服务未找到');
  console.log('请确保：');
  console.log('1. 页面已完全加载');
  console.log('2. 用户已登录');
  console.log('3. 服务已正确初始化');
}

// 监听事件测试
window.addEventListener('tokenRefreshed', (event) => {
  console.log('🎉 收到token刷新成功事件:', event.detail);
});

window.addEventListener('tokenExpired', (event) => {
  console.log('⚠️ 收到token过期事件:', event.detail);
});

console.log('🧪 测试脚本已运行，请查看控制台输出');
console.log('💡 提示：访问 /test-auth 页面可以看到可视化的调试界面'); 