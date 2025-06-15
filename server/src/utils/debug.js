const util = require('util');

/**
 * 调试工具类
 */
class Debug {
  constructor() {
    this.isDebugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * 输出调试信息
   */
  log(message, data = null) {
    if (!this.isDebugMode) return;
    
    const timestamp = new Date().toISOString();
    console.log(`\n🐛 [DEBUG ${timestamp}] ${message}`);
    
    if (data) {
      console.log('📊 Data:', util.inspect(data, { 
        colors: true, 
        depth: 3,
        showHidden: false 
      }));
    }
  }

  /**
   * 输出API请求信息
   */
  api(req, message = 'API Request') {
    if (!this.isDebugMode) return;
    
    const timestamp = new Date().toISOString();
    console.log(`\n🌐 [API ${timestamp}] ${message}`);
    console.log(`📍 ${req.method} ${req.originalUrl}`);
    
    if (Object.keys(req.query).length > 0) {
      console.log('🔍 Query:', req.query);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 Body:', util.inspect(req.body, { colors: true, depth: 2 }));
    }
    
    if (req.headers.authorization) {
      console.log('🔐 Auth: Bearer ***');
    }
  }

  /**
   * 输出数据库查询信息
   */
  db(query, params = null, result = null) {
    if (!this.isDebugMode) return;
    
    const timestamp = new Date().toISOString();
    console.log(`\n🗄️  [DB ${timestamp}] Query`);
    console.log('📝 SQL:', query);
    
    if (params) {
      console.log('🎯 Params:', params);
    }
    
    if (result) {
      console.log('📊 Result:', util.inspect(result, { colors: true, depth: 1 }));
    }
  }

  /**
   * 输出错误信息
   */
  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`\n❌ [ERROR ${timestamp}] ${message}`);
    
    if (error) {
      console.error('💥 Error Details:', error);
      if (error.stack) {
        console.error('📚 Stack Trace:', error.stack);
      }
    }
  }

  /**
   * 输出性能信息
   */
  performance(label, startTime) {
    if (!this.isDebugMode) return;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const timestamp = new Date().toISOString();
    
    console.log(`\n⚡ [PERF ${timestamp}] ${label}: ${duration}ms`);
  }

  /**
   * 创建性能计时器
   */
  timer(label) {
    const startTime = Date.now();
    return {
      end: () => this.performance(label, startTime)
    };
  }
}

// 导出单例实例
module.exports = new Debug(); 