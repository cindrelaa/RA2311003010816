const axios = require("axios");
require("dotenv").config();

const Log = async (stack, level, pkg, message) => {
  try {
    await axios.post(
      "http://20.207.122.201/evaluation-service/logs",
      {
        stack: stack,
        level: level,
        package: pkg,
        message: message
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`
        }
      }
    );
  } catch (error) {
    console.error("Log failed:", error.message);
  }
};

module.exports = Log;