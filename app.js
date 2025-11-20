require("dotenv").config();
const express = require("express");
const logRequest = require("./middlewares/loger.js");
const validateTodo = require("./middlewares/validator.js");
const errorHandler = require("./middlewares/errorHandler.js");
const connectDb = require("./database/db.js");
const Todo = require("./models/todomodel.js");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS
const corsOptions = {
  origin: "http://localhost:3000",
};

// Middleware
app.use(cors(corsOptions));
connectDb();
app.use(express.json());
app.use(logRequest);

console.log("✅ This is the REAL index.js you're running!");


//  ROOT ROUTE (Landing Page)

app.get("/", (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "index.html"));
  } catch (error) {
    next(error);  
  }
});

//  GET all todos + optional filter

app.get("/todos", async (req, res, next) => {
  try {
    const { completed } = req.query;
    let filter = {};

    if (completed !== undefined) {
      const value = completed.toLowerCase();
      if (value === "true") filter.completed = true;
      else if (value === "false") filter.completed = false;
    }

    const todos = await Todo.find(filter);
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
});

//  GET all completed todos

app.get("/todos/completed", async (req, res, next) => {
  try {
    const completed = await Todo.find({ completed: true });
    res.json(completed);
  } catch (error) {
    next(error);
  }
});

//  GET single todo

app.get("/todos/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});

//  CREATE new todo

app.post("/todos", validateTodo, async (req, res, next) => {
  try {
    const { task, completed } = req.body;

    const newTodo = new Todo({
      task,
      completed,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
});


//  UPDATE todo

app.patch("/todos/:id", validateTodo, async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});


//  DELETE todo

app.delete("/todos/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(204).json({ message: `Todo ${req.params.id} deleted` });
  } catch (error) {
    next(error);
  }
});


// Global Error Handler

app.use(errorHandler);


//  Start Server (Render-compatible)

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is listening on ${HOST}:${PORT}`);
});