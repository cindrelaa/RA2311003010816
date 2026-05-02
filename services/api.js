const axios = require("axios");
require("dotenv").config();

const BASE_URL = "http://20.207.122.201/evaluation-service";

const headers = {
  Authorization: `Bearer ${process.env.TOKEN}`
};

// Get depots
const getDepots = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/depots`, { headers });
    return res.data.depots;
  } catch (error) {
    console.error("Error fetching depots:", error.message);
  }
};

// Get vehicles
const getVehicles = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/vehicles`, { headers });
    return res.data.vehicles;
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
  }
};

module.exports = { getDepots, getVehicles };