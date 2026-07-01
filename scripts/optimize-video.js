/* eslint-disable @typescript-eslint/no-require-imports */
const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const videoDir = path.join(publicDir, 'videos');
const originalInputPath = path.join(videoDir, 'enhance_ocean_hill_villas.mp4');
const backupPath = path.join(videoDir, 'enhance_ocean_hill_villas_original.mp4');
const outputPath = path.join(videoDir, 'enhance_ocean_hill_villas.mp4');
const tempOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas_temp.mp4');
const webmOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas.webm');
const tempWebmOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas_temp.webm');

const mobileOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas_mobile.mp4');
const tempMobileOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas_mobile_temp.mp4');
const mobileWebmOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas_mobile.webm');
const tempMobileWebmOutputPath = path.join(videoDir, 'enhance_ocean_hill_villas_mobile_temp.webm');

console.log('--- Video Optimization Script (Enhanced Video) ---');
console.log('FFmpeg binary:', ffmpeg);

// If the backup doesn't exist, backup the current input video first
if (!fs.existsSync(backupPath)) {
  if (fs.existsSync(originalInputPath)) {
    console.log('Creating backup of original enhanced video...');
    fs.copyFileSync(originalInputPath, backupPath);
  } else {
    console.error('Error: Original enhanced video not found at', originalInputPath);
    process.exit(1);
  }
}

const stats = fs.statSync(backupPath);
console.log('Original file size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

try {
  // 1. DESKTOP OPTIMIZATION (MP4)
  console.log('Running FFmpeg for Desktop MP4...');
  const desktopArgs = [
    '-y',
    '-i', backupPath,
    '-g', '12',
    '-keyint_min', '12',
    '-bf', '0',
    '-c:v', 'libx264',
    '-crf', '26',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    tempOutputPath
  ];

  const resultDesktop = spawnSync(ffmpeg, desktopArgs, { stdio: 'inherit' });
  if (resultDesktop.status !== 0) {
    throw new Error(`FFmpeg desktop MP4 exited with status ${resultDesktop.status}`);
  }

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  fs.renameSync(tempOutputPath, outputPath);
  const desktopStats = fs.statSync(outputPath);
  console.log('Desktop optimized MP4 size:', (desktopStats.size / 1024 / 1024).toFixed(2), 'MB');

  // 2. DESKTOP OPTIMIZATION (WEBM)
  console.log('Running FFmpeg for Desktop WebM (VP9)...');
  const desktopWebmArgs = [
    '-y',
    '-i', backupPath,
    '-c:v', 'libvpx-vp9',
    '-crf', '36',
    '-b:v', '0',
    '-deadline', 'good',
    '-speed', '2',
    '-pix_fmt', 'yuv420p',
    '-an',
    tempWebmOutputPath
  ];

  const resultDesktopWebm = spawnSync(ffmpeg, desktopWebmArgs, { stdio: 'inherit' });
  if (resultDesktopWebm.status !== 0) {
    throw new Error(`FFmpeg desktop WebM exited with status ${resultDesktopWebm.status}`);
  }

  if (fs.existsSync(webmOutputPath)) {
    fs.unlinkSync(webmOutputPath);
  }
  fs.renameSync(tempWebmOutputPath, webmOutputPath);
  const desktopWebmStats = fs.statSync(webmOutputPath);
  console.log('Desktop optimized WebM size:', (desktopWebmStats.size / 1024 / 1024).toFixed(2), 'MB');

  // 3. MOBILE OPTIMIZATION (MP4)
  console.log('Running FFmpeg for Mobile MP4 (480p)...');
  const mobileArgs = [
    '-y',
    '-i', backupPath,
    '-g', '12',
    '-keyint_min', '12',
    '-bf', '0',
    '-c:v', 'libx264',
    '-crf', '32',
    '-vf', 'scale=-2:480',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    tempMobileOutputPath
  ];

  const resultMobile = spawnSync(ffmpeg, mobileArgs, { stdio: 'inherit' });
  if (resultMobile.status !== 0) {
    throw new Error(`FFmpeg mobile MP4 exited with status ${resultMobile.status}`);
  }

  if (fs.existsSync(mobileOutputPath)) {
    fs.unlinkSync(mobileOutputPath);
  }
  fs.renameSync(tempMobileOutputPath, mobileOutputPath);
  const mobileStats = fs.statSync(mobileOutputPath);
  console.log('Mobile optimized MP4 size:', (mobileStats.size / 1024 / 1024).toFixed(2), 'MB');

  // 4. MOBILE OPTIMIZATION (WEBM)
  console.log('Running FFmpeg for Mobile WebM (480p, VP9)...');
  const mobileWebmArgs = [
    '-y',
    '-i', backupPath,
    '-c:v', 'libvpx-vp9',
    '-crf', '40',
    '-b:v', '0',
    '-vf', 'scale=-2:480',
    '-deadline', 'good',
    '-speed', '2',
    '-pix_fmt', 'yuv420p',
    '-an',
    tempMobileWebmOutputPath
  ];

  const resultMobileWebm = spawnSync(ffmpeg, mobileWebmArgs, { stdio: 'inherit' });
  if (resultMobileWebm.status !== 0) {
    throw new Error(`FFmpeg mobile WebM exited with status ${resultMobileWebm.status}`);
  }

  if (fs.existsSync(mobileWebmOutputPath)) {
    fs.unlinkSync(mobileWebmOutputPath);
  }
  fs.renameSync(tempMobileWebmOutputPath, mobileWebmOutputPath);
  const mobileWebmStats = fs.statSync(mobileWebmOutputPath);
  console.log('Mobile optimized WebM size:', (mobileWebmStats.size / 1024 / 1024).toFixed(2), 'MB');

  console.log('Done! All videos optimized successfully.');
} catch (error) {
  console.error('Error during optimization:', error);
  if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
  if (fs.existsSync(tempWebmOutputPath)) fs.unlinkSync(tempWebmOutputPath);
  if (fs.existsSync(tempMobileOutputPath)) fs.unlinkSync(tempMobileOutputPath);
  if (fs.existsSync(tempMobileWebmOutputPath)) fs.unlinkSync(tempMobileWebmOutputPath);
  process.exit(1);
}
