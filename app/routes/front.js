const express = require('express');
const Todo = require('./../models/Todo');

const router = express.Router();

// Home page route
router.get('/', async (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; script-src 'self'");
    try {
        const todos = await Todo.find()
        res.render("todos", {
            todos: todos,
            errorMessage: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("todos", { todos: [], errorMessage: 'Error retrieving todo items' });
    }
});

// POST - Submit Task
router.post('/', async (req, res) => {
    const task = req.body.task;

    if (!task || task.trim() === '') {
        const todos = await Todo.find();
        return res.status(400).render("todos", { todos: todos, errorMessage: 'Task cannot be empty' });
    }

    const newTask = new Todo({
        task: task
    });

    newTask.save()
        .then(task => res.redirect('/'))
        .catch(async err => {
            console.error(err);
            const todos = await Todo.find();
            res.status(500).render("todos", { todos: todos, errorMessage: 'Error saving task' });
        });
});

router.post('/todo/destroy', async (req, res) => {
    const taskKey = req.body._key;
    try {
        const result = await Todo.findOneAndRemove({ _id: taskKey });
        if (!result) {
            const todos = await Todo.find();
            return res.status(404).render("todos", { todos: todos, errorMessage: 'Todo item not found' });
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        const todos = await Todo.find();
        res.status(500).render("todos", { todos: todos, errorMessage: 'Error deleting todo item' });
    }
});


module.exports = router;