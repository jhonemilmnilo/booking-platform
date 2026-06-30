/* eslint-disable @typescript-eslint/no-require-imports */
const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const result = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8' });
console.log('stdout:', result.stdout ? result.stdout.slice(0, 100) : 'none');
console.log('stderr:', result.stderr ? result.stderr.slice(0, 100) : 'none');
console.log('status:', result.status);
console.log('error:', result.error);
