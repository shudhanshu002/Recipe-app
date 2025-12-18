import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = './public/temp';

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB
    },
});
