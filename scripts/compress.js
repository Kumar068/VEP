import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '../public/content');

const formatBytes = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';

async function compressVideo(inputPath, outputPath, options) {
    return new Promise((resolve, reject) => {
        console.log(`Compressing ${path.basename(inputPath)}...`);
        const startTime = Date.now();

        let command = ffmpeg(inputPath);

        if (options.videoCodec) command = command.videoCodec(options.videoCodec);
        if (options.crf) command = command.addOption('-crf', options.crf);
        if (options.preset) command = command.addOption('-preset', options.preset);
        if (options.scale) command = command.size(options.scale);
        if (options.mute) command = command.noAudio();
        if (options.framerate) command = command.fps(options.framerate);
        // For smaller files, we use 2 passes or just strict CRF. Let's stick to CRF for speed.
        // Ensure FastStart for MP4
        if (outputPath.endsWith('.mp4')) {
            command = command.addOption('-movflags', 'faststart');
        }

        command
            .on('end', () => {
                const origSize = fs.statSync(inputPath).size;
                const newSize = fs.statSync(outputPath).size;
                console.log(`✅ ${path.basename(outputPath)} done in ${(Date.now() - startTime) / 1000}s`);
                console.log(`   Size: ${formatBytes(origSize)} -> ${formatBytes(newSize)} (-${Math.round((1 - newSize / origSize) * 100)}%)\n`);
                resolve();
            })
            .on('error', (err) => {
                console.error(`❌ Error compressing ${path.basename(inputPath)}:`, err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

async function run() {
    console.log('Starting asset compression pipeline...\n');

    // 1. Hero Video (WEBM)
    // Very large (67MB). Let's use vp9, crf 30, scale to 720p maximum, no audio.
    await compressVideo(
        path.join(contentDir, 'hero-video.webm'),
        path.join(contentDir, 'hero-video-compressed.webm'),
        { videoCodec: 'libvpx-vp9', crf: '35', scale: '1280x?', mute: true }
    );

    // 2. Background Video (MP4)
    // 47MB. Let's use h264, crf 28, 720p, no audio.
    await compressVideo(
        path.join(contentDir, 'background.mp4'),
        path.join(contentDir, 'background-compressed.mp4'),
        { videoCodec: 'libx264', crf: '30', preset: 'faster', scale: '1280x?', mute: true }
    );

    // 3. Loader GIF (GIF -> WEBM)
    // GIFs are huge. WEBM VP9 is much smaller for looping animations.
    await compressVideo(
        path.join(contentDir, 'loader.gif'),
        path.join(contentDir, 'loader.webm'),
        { videoCodec: 'libvpx-vp9', crf: '25', mute: true, framerate: 15 } // Reduced framerate for loader
    );

    // 4. Glimpse Image (PNG -> WEBP)
    console.log('Compressing glimpse-image.png...');
    const glimpseIn = path.join(contentDir, 'glimpse-image.png');
    const glimpseOut = path.join(contentDir, 'glimpse-image.webp');

    await sharp(glimpseIn)
        .resize({ width: 1200, withoutEnlargement: true }) // Max 1200px wide
        .webp({ quality: 80, effort: 6 })
        .toFile(glimpseOut);

    const origPng = fs.statSync(glimpseIn).size;
    const newWebp = fs.statSync(glimpseOut).size;
    console.log(`✅ glimpse-image.webp done`);
    console.log(`   Size: ${formatBytes(origPng)} -> ${formatBytes(newWebp)} (-${Math.round((1 - newWebp / origPng) * 100)}%)\n`);

    console.log('Compression pipeline finished successfully! 🎉');
}

run().catch(console.error);
