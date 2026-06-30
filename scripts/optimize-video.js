/* eslint-disable @typescript-eslint/no-require-imports */
const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const originalPath = path.join(publicDir, 'ocean_hill_villa_original.mp4');
const outputPath = path.join(publicDir, 'ocean_hill_villa.mp4');
const tempOutputPath = path.join(publicDir, 'ocean_hill_villa_temp.mp4');

console.log('--- Video Optimization Script (Balanced Mode) ---');
console.log('FFmpeg binary:', ffmpeg);

// Restore original first if backup exists
if (!fs.existsSync(originalPath)) {
  console.error('Error: Original backup not found at', originalPath);
  process.exit(1);
}

const stats = fs.statSync(originalPath);
console.log('Original file size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

try {
  // Balanced approach for scroll seeking:
  // -g 15: Keyframe every 15 frames (~0.6s at 24fps) - small enough for smooth seeks
  // -bf 0: No B-frames — simpler decode, faster seeks
  // -crf 28: More compression to keep file size small
  // -preset fast: Faster encoding, slightly less compression efficiency
  // -movflags +faststart: Move moov atom to front so video loads fast in browser
  // -an: Remove audio
  const args = [
    '-y',
    '-i', originalPath,
    '-g', '15',
    '-keyint_min', '15',
    '-bf', '0',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    tempOutputPath
  ];

  console.log('Running FFmpeg (balanced mode)...');
  const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error(`FFmpeg exited with status ${result.status}`);
  }

  // Replace the current (g=1) version with the balanced one
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  fs.renameSync(tempOutputPath, outputPath);

  const newStats = fs.statSync(outputPath);
  console.log('Optimized file size:', (newStats.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('Done! Video optimized with fast-start + short keyframe interval for smooth seeking.');
} catch (error) {
  console.error('Error during optimization:', error);
  if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
  process.exit(1);
}
