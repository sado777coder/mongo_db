require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

console.log("✅ This is the REAL index.js you're running!");

// ✅ In-memory todo list
let todos = [
  { id: 1, task: "learn node.js", completed: false },
  { id: 2, task: "build crud api", completed: true },
];

// ✅ Routes
app.get("/todos", (req, res) => {
  let result = todos;
  if (req.query.completed !== undefined) {
    const isCompleted = req.query.completed === "true";
    result = todos.filter(t => t.completed === isCompleted);
  }
  res.status(200).json(result);
});

app.get("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  res.status(200).json(todo);
});

app.post("/todos", (req, res) => {
  const { task, completed = false } = req.body;
  if (!task || typeof task !== "string") {
    return res.status(400).json({ error: "Task is required and must be a string" });
  }
  const newId = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  const newTodo = { id: newId, task, completed };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.patch("/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ message: "Todo not found" });

  const { task, completed } = req.body;
  if (task !== undefined && typeof task !== "string") {
    return res.status(400).json({ error: "Task must be a string" });
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "Completed must be a boolean" });
  }

  if (task !== undefined) todo.task = task;
  if (completed !== undefined) todo.completed = completed;

  res.status(200).json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length === initialLength) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(204).send();
});

app.get("/todos/active", (req, res) => {
  const activeTodos = todos.filter(t => !t.completed);
  res.status(200).json(activeTodos);
});

// ✅ Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ✅ Render-specific fix: use the provided port & bind to 0.0.0.0
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is listening on ${HOST}:${PORT}`);
});