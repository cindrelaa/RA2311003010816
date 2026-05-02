require("dotenv").config();

const { getDepots, getVehicles } = require("./services/api");
const solveKnapsack = require("./services/scheduler");
const Log = require("./logging_middleware/logger");

const main = async () => {
  try {
    const depots = await getDepots();
    const vehicles = await getVehicles();

    if (!depots || !vehicles) {
      console.log("Failed to fetch data.");
      return;
    }

    for (let depot of depots) {
      const capacity = depot.MechanicHours;

      // Independent knapsack (BEST APPROACH)
      const selected = await solveKnapsack(vehicles, capacity);

      const totalImpact = selected.reduce((sum, t) => sum + t.Impact, 0);
      const totalDuration = selected.reduce((sum, t) => sum + t.Duration, 0);

      console.log(`\nDepot ${depot.ID}`);
      console.log("Tasks:", selected.map(t => t.TaskID));
      console.log("Total Impact:", totalImpact);
      console.log("Total Duration:", totalDuration);

      await Log(
        "backend",
        "info",
        "controller",
        `Depot ${depot.ID} processed`
      );
    }

  } catch (error) {
    console.error("Error:", error.message);
    await Log("backend", "error", "controller", "Main execution failed");
  }
};

main();
