const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

/**
 * 生成唯一文件名
 * @param {string} originalName - 原始文件名
 * @param {string} prefix - 前缀
 * @returns {string} 新文件名
 */
function generateFileName(originalName, prefix = '') {
  const ext = path.extname(originalName);
  const uuid = uuidv4();
  return `${prefix}${prefix ? '_' : ''}${uuid}${ext}`;
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

/**
 * 检查文件类型是否允许
 * @param {string} mimetype - MIME类型
 * @param {Array} allowedTypes - 允许的类型数组
 * @returns {boolean} 是否允许
 */
function isAllowedFileType(mimetype, allowedTypes) {
  return allowedTypes.includes(mimetype);
}

/**
 * 压缩图片
 * @param {string} inputPath - 输入路径
 * @param {string} outputPath - 输出路径
 * @param {Object} options - 压缩选项
 */
async function compressImage(inputPath, outputPath, options = {}) {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'jpeg'
  } = options;

  await sharp(inputPath)
    .resize(width, height, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ quality })
    .toFile(outputPath);
}

/**
 * 生成缩略图
 * @param {string} inputPath - 输入路径
 * @param {string} outputPath - 输出路径
 * @param {number} size - 缩略图尺寸
 */
async function generateThumbnail(inputPath, outputPath, size = 200) {
  await sharp(inputPath)
    .resize(size, size, { 
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 */
async function deleteFile(filePath) {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('删除文件失败:', error);
  }
}

/**
 * 获取文件信息
 * @param {string} filePath - 文件路径
 * @returns {Object} 文件信息
 */
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      exists: true
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * 复制文件
 * @param {string} src - 源文件路径
 * @param {string} dest - 目标文件路径
 */
async function copyFile(src, dest) {
  await fs.copy(src, dest);
}

/**
 * 移动文件
 * @param {string} src - 源文件路径
 * @param {string} dest - 目标文件路径
 */
async function moveFile(src, dest) {
  await fs.move(src, dest);
}

module.exports = {
  ensureDir,
  generateFileName,
  getFileExtension,
  isAllowedFileType,
  compressImage,
  generateThumbnail,
  deleteFile,
  getFileInfo,
  copyFile,
  moveFile
}; 