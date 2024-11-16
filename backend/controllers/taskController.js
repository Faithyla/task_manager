const Task = require('../models/Task');

// Create a new task
const createTask = async (req, res) => {
    const { title, description, priority, deadline } = req.body;

    try {
        const task = new Task({
            user: req.user.id, // From auth middleware
            title,
            description,
            priority,
            deadline,
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.status(200).json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a single task
const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { title, description, priority, deadline } = req.body;

    try {
        let task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update fields
        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;
        task.deadline = deadline || task.deadline;

        await task.save();
        res.status(200).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await task.deleteOne();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Filter tasks
const filterTasks = async (req, res) => {
    const { priority, deadline } = req.query;

    try {
        // Build filter object based on query parameters
        const filter = {};
        if (priority) filter.priority = priority;
        if (deadline) filter.deadline = { $lte: new Date(deadline) };

        const tasks = await Task.find(filter);

        res.status(200).json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Search tasks by query term
const searchTasks = async (req, res) => {
    const { query } = req.query;  // Get the search query from the URL

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: 'Query parameter must be a non-empty string' });
    }

    try {
        // Find tasks where the title or description contains the query (case-insensitive)
        const tasks = await Task.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ],
            user: req.user.id  // Make sure the tasks belong to the logged-in user
        });

        res.status(200).json(tasks);  // Return the tasks as JSON
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};




module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, filterTasks, searchTasks };