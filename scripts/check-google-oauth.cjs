#!/usr/bin/env node

/**
 * Google OAuth 2.0 配置检查脚本
 * 帮助诊断 Google 登录配置问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Google OAuth 2.0 配置...\n');

// 检查环境变量文件
const envFiles = ['.env.local', '.env', '.env.development.local'];
let envFound = false;
let googleClientId = null;

for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ 找到环境变量文件: ${envFile}`);
    envFound = true;
    
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/VITE_GOOGLE_CLIENT_ID\s*=\s*(.+)/);
    if (match) {
      googleClientId = match[1].trim().replace(/['"]/g, '');
      console.log(`✅ 找到 VITE_GOOGLE_CLIENT_ID: ${googleClientId.substring(0, 20)}...`);
    }
    break;
  }
}

if (!envFound) {
  console.log('❌ 未找到环境变量文件 (.env.local, .env, .env.development.local)');
  console.log('   请创建 .env.local 文件并添加 VITE_GOOGLE_CLIENT_ID\n');
}

// 检查 Google Client ID 格式
if (googleClientId) {
  if (googleClientId === 'your_google_client_id_here.apps.googleusercontent.com') {
    console.log('❌ Google Client ID 未配置（使用的是默认占位符）');
  } else if (!googleClientId.endsWith('.apps.googleusercontent.com')) {
    console.log('❌ Google Client ID 格式不正确');
    console.log('   正确格式应该以 .apps.googleusercontent.com 结尾');
  } else {
    console.log('✅ Google Client ID 格式正确');
  }
} else {
  console.log('❌ 未找到 VITE_GOOGLE_CLIENT_ID 环境变量');
}

// 检查 HTML 文件中的 Google 脚本
const indexHtmlPath = path.join(process.cwd(), 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  if (htmlContent.includes('accounts.google.com/gsi/client')) {
    console.log('✅ 找到 Google Sign-In 脚本引用');
  } else {
    console.log('❌ 未找到 Google Sign-In 脚本引用');
    console.log('   请确保 index.html 中包含 Google GSI 脚本');
  }
} else {
  console.log('❌ 未找到 index.html 文件');
}

// 检查 Google 登录组件
const googleButtonPath = path.join(process.cwd(), 'src/components/common/GoogleLoginButton.tsx');
if (fs.existsSync(googleButtonPath)) {
  console.log('✅ 找到 Google 登录组件');
} else {
  console.log('❌ 未找到 Google 登录组件');
}

console.log('\n📋 配置检查完成！');

// 提供解决方案
if (!envFound || !googleClientId || googleClientId === 'your_google_client_id_here.apps.googleusercontent.com') {
  console.log('\n🔧 解决方案：');
  console.log('1. 访问 Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. 创建 OAuth 2.0 客户端 ID');
  console.log('3. 创建 .env.local 文件并添加：');
  console.log('   VITE_GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com');
  console.log('4. 参考详细配置指南: GOOGLE_OAUTH_SETUP.md');
}

console.log('\n🌐 当前环境信息：');
console.log(`   Node.js: ${process.version}`);
console.log(`   工作目录: ${process.cwd()}`);
console.log(`   当前时间: ${new Date().toLocaleString()}`); 