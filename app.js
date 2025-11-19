require("dotenv").config();
const express = require("express");
const logRequest = require("./middlewares/loger.js");
const validateTodo = require("./middlewares/validator.js");
const errorHandler = require("./middlewares/errorHandler.js");
const connectDb = require("./database/db.js");
const Todo = require("./models/todomodel.js");
const cors = require("cors");

const app = express();
const corsOptinos = {
  origin : `http://localhost:3000/todos`,
};

// ✅ Middleware
app.use(cors());
connectDb();
app.use(express.json());
app.use(logRequest);

console.log("✅ This is the REAL index.js you're running!");


// ✅ Routes
app.get("/todos", async (req, res, next) => {
  try {
    const { completed } = req.query;

let filter = {};

// Only apply filter if query exists
if (completed !== undefined) {
  // Normalize query to lowercase (e.g., TRUE, True → true)
  const value = completed.toLowerCase();

  if (value === "true") filter.completed = true;
  else if (value === "false") filter.completed = false;
}

 const todos = await Todo.find(filter);
  res.status(200).json(todos);
  } catch (error) {
    next (error);
  }
});

app.get("/todos/completed", async (req, res, next) => {
  try {
    const completed = await Todo.find({completed : true});
  res.json(completed);
  } catch (error) {
    
    next (error)
  }

})

// get single todo
app.get("/todos/:id", async (req, res, next) => {
try {
   const todo = await Todo.findById(req.params.id);
 if (!todo) {
   return res.status(404).json({message : "todo not fonud"});
  };
  res.status(200).json(todo);
} catch (error) {
  next (error);
}
});

// create new todo
app.post("/todos", validateTodo, async (req, res, next) => {
  const {task, completed} = req.body;
  const newTodo = new Todo({
    task,
    completed
  });

  await newTodo.save();

 try {
   
  res.status(201).json(newTodo);
 } catch (error) {

  next (error);
 }
});
 
// update todos
app.patch("/todos/:id", validateTodo, async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body ,{
      new : true
    }) 

    if (!todo) {
   return res.status(404).json({message : "todo not fonud"});
  };

    res.status(200).json(todo);
  } catch (error) {
    next (error);
  }
});

app.delete("/todos/:id", async (req, res, next) => {
 try {
   const todo = await Todo.findByIdAndDelete(req.params.id);

   if (!todo) {
   return res.status(404).json({message : "todo not fonud"});
  };
  res.status(204).json({message : `Todo ${req.params.id} deleted`});
 } catch (error) {

  next (error);
 }
});

// ✅ Central error handler
app.use(errorHandler);

//  Render-specific fix: use the provided port & bind to 0.0.0.0
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is listening on ${HOST}:${PORT}`);
});