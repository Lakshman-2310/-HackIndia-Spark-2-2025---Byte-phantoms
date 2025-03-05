const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new task
router.post('/tasks', auth, async (req, res) => {
    const { title, description, dueDate, priority } = req.body;

    try {
        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            user: req.user._id, // Associate the task with the logged-in user
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all tasks for the logged-in user
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }); // Fetch tasks for the logged-in user
        res.json(tasks);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single task by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findOne({ _id: id, user: req.user._id }); // Ensure the task belongs to the logged-in user

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a task by ID
router.patch('/tasks/:id', auth, async (req, res) => {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'dueDate', 'priority', 'completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates!' });
    }

    try {
        const task = await Task.findOne({ _id: id, user: req.user._id }); // Ensure the task belongs to the logged-in user

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Apply updates
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.json(task);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a task by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findOneAndDelete({ _id: id, user: req.user._id }); // Ensure the task belongs to the logged-in user

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
