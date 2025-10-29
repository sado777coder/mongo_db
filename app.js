require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());          // Enable CORS
app.use(express.json());

console.log("✅ This is the REAL index.js you're running!");

// In-memory todo list
let todos = [
    { id: 1, task: "learn node.js", completed: false },
    { id: 2, task: "build crud api", completed: true },
];

// ✅ Get all todos (with optional query filter: ?completed=true/false)
app.get("/todos", (req, res) => {
    let result = todos;

    if (req.query.completed !== undefined) {
        const isCompleted = req.query.completed === "true";
        result = todos.filter(t => t.completed === isCompleted);
    }

    res.status(200).json(result);
});

// ✅ Get single todo
app.get("/todos/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json(todo);
});

// ✅ Add new todo with validation
app.post("/todos", (req, res) => {
    const { task, completed = false } = req.body;

    if (!task || typeof task !== 'string') {
        return res.status(400).json({ error: "Task is required and must be a string" });
    }

    const newId = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    const newTodo = { id: newId, task, completed };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// ✅ Update todo partially with validation
app.patch("/todos/:id", (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const { task, completed } = req.body;

    if (task !== undefined && typeof task !== 'string') {
        return res.status(400).json({ error: "Task must be a string" });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ error: "Completed must be a boolean" });
    }

    if (task !== undefined) todo.task = task;
    if (completed !== undefined) todo.completed = completed;

    res.status(200).json(todo);
});

// ✅ Delete todo
app.delete("/todos/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id);

    if (todos.length === initialLength) {
        return res.status(404).json({ error: "Todo not found" });
    }

    res.status(204).send(); // No content
});

// ✅ Bonus: Get only active todos
app.get("/todos/active", (req, res) => {
    const activeTodos = todos.filter(t => !t.completed);
    res.status(200).json(activeTodos);
});

// ✅ Central error handler (optional)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ error: "Something went wrong" });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
console.log('Starting server...');
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});