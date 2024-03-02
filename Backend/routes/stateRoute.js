
const express = require('express');
const stateRoute = express.Router();

// const stateController = require('../controllers/stateController');
const {verifyHR} = require('../middleware/authMiddleware');
const { getAllStates, createState, updateState, deleteState } = require('../controllers/stateControler');

// GET: Retrieve all countries
// verifyHR
stateRoute.get("/state/:id?", verifyHR, getAllStates);

// POST: Create a new state
stateRoute.post("/state", verifyHR, createState);

// PUT: Update an existing state
stateRoute.put("/state/:id", verifyHR, updateState);

// DELETE: Delete a state
stateRoute.delete("/state/:id", verifyHR, deleteState);

module.exports = stateRoute;