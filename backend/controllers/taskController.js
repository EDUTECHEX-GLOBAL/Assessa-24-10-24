// backend/controllers/taskController.js
const Task = require("../models/webapp-models/taskModel");

// Get all tasks for a user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const newTask = new Task({ title, description, status, dueDate, user: req.user.id });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }
    await task.remove();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
