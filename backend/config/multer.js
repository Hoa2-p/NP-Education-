const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const maxFileSize = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/octet-stream'
]);

const allowedExtensions = new Set([
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    '.txt',
    '.jpg',
    '.jpeg',
    '.png'
]);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const isAllowedMimeType = allowedMimeTypes.has(file.mimetype);
    const isAllowedExtension = allowedExtensions.has(extension);

    if (isAllowedMimeType && isAllowedExtension) {
        return cb(null, true);
    }

    return cb(new Error('Loại file không được hỗ trợ. Chỉ cho phép PDF, Word, PowerPoint, Excel, TXT, JPG, PNG.'), false);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize }
});
