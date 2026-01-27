import express from 'express';
import Class from '../models/Class.js';

const router = express.Router();

// GET all classes
router.get('/', async (req, res) => {
    try {
        const classes = await Class.findAll();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new class
router.post('/', async (req, res) => {
    try {
        const newClass = await Class.create(req.body);
        res.status(201).json(newClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
