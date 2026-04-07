const db = require('../config/db');
const path = require('path');

// Detect file type from extension
const detectType = (filename = '') => {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext)) return 'Video';
    if (['ppt', 'pptx'].includes(ext)) return 'Slide';
    if (['doc', 'docx'].includes(ext)) return 'Word';
    return 'PDF';
};

// Get all materials (no class filter)
exports.getAllMaterials = async (req, res) => {
    try {
        const [materials] = await db.query(
            'SELECT * FROM learning_materials ORDER BY created_at DESC'
        );
        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching all materials:', error);
        res.status(500).json({ message: 'Internal server error while fetching materials.' });
    }
};

exports.getMaterialsByClass = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ message: 'Class ID is required' });
        }

        const [materials] = await db.query(
            'SELECT * FROM learning_materials WHERE class_id = ? ORDER BY created_at DESC',
            [classId]
        );

        if (materials.length === 0) {
            return res.status(404).json({ message: 'No learning material available.' });
        }

        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: 'Internal server error while fetching materials.' });
    }
};

exports.createMaterial = async (req, res) => {
    try {
        const { classId } = req.params;
        const { name, description } = req.body;
        let url = req.body.url || '';
        let type = 'PDF';

        if (req.file) {
            url = `http://localhost:5000/uploads/${req.file.filename}`;
            type = detectType(req.file.originalname);
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập tên tài liệu và chọn tệp tải lên.' });
        }
        if (!url) {
            return res.status(400).json({ message: 'Vui lòng nhập tên tài liệu và chọn tệp tải lên.' });
        }

        const [result] = await db.query(
            'INSERT INTO learning_materials (class_id, name, type, url, description) VALUES (?, ?, ?, ?, ?)',
            [classId, name.trim(), type, url, description || '']
        );

        res.status(201).json({ message: 'Material created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ message: 'Internal server error while creating material.' });
    }
};

exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập tên tài liệu.' });
        }

        // Fetch existing material to preserve type/url if no new file
        const [existing] = await db.query('SELECT * FROM learning_materials WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        let url = existing[0].url;
        let type = existing[0].type;

        // If new file uploaded, use it
        if (req.file) {
            url = `http://localhost:5000/uploads/${req.file.filename}`;
            type = detectType(req.file.originalname);
        }

        const [result] = await db.query(
            'UPDATE learning_materials SET name = ?, description = ?, type = ?, url = ? WHERE id = ?',
            [name.trim(), description || '', type, url, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        res.status(200).json({ message: 'Material updated successfully' });
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ message: 'Internal server error while updating material.' });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM learning_materials WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ message: 'Internal server error while deleting material.' });
    }
};
