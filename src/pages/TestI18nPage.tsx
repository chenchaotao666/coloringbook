import React from 'react';
import { useLanguage, useAsyncTranslation } from '../contexts/LanguageContext';

const TestI18nPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { t: homeT, loading: homeLoading } = useAsyncTranslation('home');
  const { t: commonT } = useAsyncTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌐 国际化测试页面
          </h1>
          <p className="text-lg text-gray-600">
            当前语言: <span className="font-medium">{language === 'zh' ? '简体中文' : 'English'}</span>
          </p>
          
          {/* 语言切换按钮 */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'zh'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 测试各种翻译模块 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 导航模块 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📱 导航翻译
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>首页:</strong> {t('navigation.menu.home')}</p>
              <p><strong>免费涂色页:</strong> {t('navigation.menu.coloringPagesFree')}</p>
              <p><strong>价格:</strong> {t('navigation.menu.pricing')}</p>
              <p><strong>登录:</strong> {t('navigation.menu.login')}</p>
              <p><strong>个人中心:</strong> {t('navigation.menu.profile')}</p>
            </div>
          </div>

          {/* 通用按钮 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔘 通用按钮
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>确认:</strong> {commonT('buttons.confirm')}</p>
              <p><strong>取消:</strong> {commonT('buttons.cancel')}</p>
              <p><strong>保存:</strong> {commonT('buttons.save')}</p>
              <p><strong>删除:</strong> {commonT('buttons.delete')}</p>
              <p><strong>下载:</strong> {commonT('buttons.download')}</p>
            </div>
          </div>

          {/* 状态消息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ℹ️ 状态消息
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>加载中:</strong> {commonT('status.loading')}</p>
              <p><strong>成功:</strong> {commonT('status.success')}</p>
              <p><strong>错误:</strong> {commonT('status.error')}</p>
              <p><strong>处理中:</strong> {commonT('status.processing')}</p>
              <p><strong>已完成:</strong> {commonT('status.completed')}</p>
            </div>
          </div>

          {/* 表单相关 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📝 表单字段
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>邮箱:</strong> {t('forms.fields.email')}</p>
              <p><strong>密码:</strong> {t('forms.fields.password')}</p>
              <p><strong>用户名:</strong> {t('forms.fields.username')}</p>
              <p><strong>必填项:</strong> {t('forms.validation.required')}</p>
              <p><strong>格式不正确:</strong> {t('forms.validation.invalid')}</p>
            </div>
          </div>

          {/* 错误消息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ❌ 错误消息
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>网络错误:</strong> {t('errors.network.connectionFailed')}</p>
              <p><strong>服务器错误:</strong> {t('errors.network.serverError')}</p>
              <p><strong>未授权:</strong> {t('errors.network.unauthorized')}</p>
              <p><strong>未找到:</strong> {t('errors.network.notFound')}</p>
              <p><strong>未知错误:</strong> {t('errors.general.unknownError')}</p>
            </div>
          </div>

          {/* 首页内容（异步加载） */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🏠 首页内容 {homeLoading && <span className="text-sm text-gray-500">(加载中...)</span>}
            </h2>
            {!homeLoading && (
              <div className="space-y-2 text-sm">
                <p><strong>标题:</strong> {homeT('hero.title')}</p>
                <p><strong>副标题:</strong> {homeT('hero.subtitle')}</p>
                <p><strong>立即创建:</strong> {homeT('hero.createNow')}</p>
                <p><strong>了解更多:</strong> {homeT('hero.learnMore')}</p>
              </div>
            )}
          </div>
        </div>

        {/* 参数插值测试 */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🔧 参数插值测试
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">时间相关</h3>
              <div className="space-y-1 text-sm">
                <p>{t('common.time.minutes', undefined, { count: 5 })}</p>
                <p>{t('common.time.hours', undefined, { count: 2 })}</p>
                <p>{t('common.time.days', undefined, { count: 7 })}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">验证消息</h3>
              <div className="space-y-1 text-sm">
                <p>{t('forms.validation.passwordTooShort', undefined, { min: 6 })}</p>
                <p>{t('forms.validation.minLength', undefined, { min: 3 })}</p>
                <p>{t('forms.validation.maxLength', undefined, { max: 50 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            ✨ 国际化功能特性
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">🔄 自动语言检测</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>自动检测浏览器语言偏好</li>
                <li>持久化保存用户语言选择</li>
                <li>刷新页面后保持语言设置</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">📦 模块化翻译</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>按功能模块组织翻译资源</li>
                <li>支持异步动态加载翻译文件</li>
                <li>智能缓存机制避免重复加载</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">🎯 参数插值</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>支持 {'{key}'} 格式的参数替换</li>
                <li>动态数值和文本插值</li>
                <li>条件性复数形式处理</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">🔀 回退机制</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>翻译缺失时智能回退到英文</li>
                <li>支持自定义回退文本</li>
                <li>开发模式下显示翻译键名</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestI18nPage; 