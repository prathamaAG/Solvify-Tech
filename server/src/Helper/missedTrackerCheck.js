// cron/missedTrackerCheck.js
const { TaskTimeTracking } = require("../Database/config");
const dayjs = require("dayjs");

async function checkMissedTrackers() {
   const now = dayjs().toDate();
   
   const runningTrackers = await TaskTimeTracking.findAll({
      where: {
         end_time: null,
      },
   });

   for (const tracker of runningTrackers) {
      tracker.status = "missed";
      tracker.ended_due_to_miss = true;
      tracker.end_time = dayjs(tracker.start_time).endOf("day").toDate(); // set to midnight
      await tracker.save();
   }

   console.log(
      `[MISSED TRACKER JOB]: Processed ${runningTrackers.length} trackers at ${now}`
   );
}

module.exports = checkMissedTrackers;
