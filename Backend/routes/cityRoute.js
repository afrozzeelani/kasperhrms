

const express = require('express');
const cityRoute = express.Router();

// const cityController = require('../controllers/cityController');
const {verifyHR} = require('../middleware/authMiddleware');
const { getAllcity, createCity, updateCity, deleteCity } = require('../controllers/cityController');

// GET: Retrieve all countries
// verifyHR
cityRoute.get("/city", verifyHR,  getAllcity);

// POST: Create a new city
cityRoute.post("/city", verifyHR,  createCity);

// PUT: Update an existing city
cityRoute.put("/city/:id", verifyHR,  updateCity);

// DELETE: Delete a city
cityRoute.delete("/city/:id", verifyHR,  deleteCity);

module.exports = cityRoute;