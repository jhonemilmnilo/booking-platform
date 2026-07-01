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
  // Balanced/Highly optimized approach for scroll seeking:
  // -g 12: Keyframe every 12 frames (~0.5s at 24fps) - extremely fast seek
  // -bf 0: No B-frames — simpler decode, faster seeks
  // -crf 26: Balanced compression for quality/size
  // -preset fast: Fast encoding, clean output
  // -movflags +faststart: Move moov atom to front
  // -an: Remove audio
  const args = [
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

  console.log('Running FFmpeg...');
  const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error(`FFmpeg exited with status ${result.status}`);
  }

  // Replace original with optimized
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  fs.renameSync(tempOutputPath, outputPath);

  const newStats = fs.statSync(outputPath);
  console.log('Optimized file size:', (newStats.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('Done! Enhanced video optimized successfully for smooth scrolling.');
} catch (error) {
  console.error('Error during optimization:', error);
  if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
  process.exit(1);
}
