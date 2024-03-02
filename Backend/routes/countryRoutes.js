const express = require('express');
const contery = express.Router();
// const countryController = require('../controllers/countryController');
const {verifyHR} = require('../middleware/authMiddleware');
const { getAllCountries, createCountry, updateCountry, deleteCountry } = require('../controllers/countryController');
// GET: Retrieve all countries
// verifyHR
contery.get("/country", verifyHR, getAllCountries);

// POST: Create a new country
contery.post("/country", verifyHR, createCountry);

// PUT: Update an existing country
contery.put("/country/:id", verifyHR, updateCountry);

// DELETE: Delete a country
contery.delete("/country/:id", verifyHR, deleteCountry);

module.exports = contery;