const { TaskTimeTracking, Task, User } = require('../Database/config');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

// Start tracking time for a task
exports.startTracking = async (req, res) => {
    const { task_id } = req.body;
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if task exists
        const task = await Task.findByPk(task_id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user is already tracking any task (not necessarily this one)
        const existingActiveTracking = await TaskTimeTracking.findOne({
            where: {
                user_id: user.user_id,
                end_time: null
            }
        });

        // If user is already tracking a task, stop it first
        if (existingActiveTracking) {
            // If it's the same task, return error
            if (existingActiveTracking.task_id === task_id) {
                return res.status(400).json({ message: "You're already tracking this task" });
            }

            // Stop the currently active tracking
            const endTime = new Date();
            const duration = Math.floor((endTime - existingActiveTracking.start_time) / 1000);

            await existingActiveTracking.update({
                end_time: endTime,
                duration
            });
        }

        // Create new tracking record
        const tracking = await TaskTimeTracking.create({
            task_id,
            user_id: user.user_id,
            start_time: new Date()
        });

        // Auto-update task status to "In progress" if currently "Pending"
        if (task.status === 'Pending') {
            await task.update({ status: 'In progress' });
        }

        res.status(201).json({
            status: 1,
            message: "Time tracking started",
            data: tracking
        });

    } catch (error) {
        console.error("Error starting time tracking:", error);
        res.status(500).json({
            status: 0,
            message: "Server error",
            error: error.message
        });
    }
};

// Stop tracking time for a task
exports.stopTracking = async (req, res) => {
    const { task_id } = req.body;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find active tracking record
        const tracking = await TaskTimeTracking.findOne({
            where: {
                user_id: user.user_id,
                task_id,
                end_time: null
            }
        });

        if (!tracking) {
            return res.status(404).json({ message: "No active tracking found for this task" });
        }

        // Calculate duration in seconds
        const endTime = new Date();
        const startTime = tracking.start_time;
        const duration = Math.floor((endTime - startTime) / 1000);

        // Update tracking record
        await tracking.update({
            end_time: endTime,
            duration
        });

        res.status(200).json({
            message: "Time tracking stopped",
            data: {
                ...tracking.toJSON(),
                duration
            }
        });

    } catch (error) {
        console.error("Error stopping time tracking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Get time tracking report
exports.getTimeTrackingReport = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // For admin, get all data. For others, get only their data

        // Get tracking data grouped by date and user
        const trackingData = await TaskTimeTracking.findAll({
            include: [
                {
                    model: Task,
                    as: 'task',
                    attributes: ['title']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name']
                }
            ],
            order: [['start_time', 'DESC']]
        });

        // Format the data as requested
        const formattedData = trackingData.reduce((acc, record) => {
            const date = dayjs(record.start_time).format('YYYY-MM-DD');
            const user = record.user.name;
            const taskTitle = record.task.title;
            const duration = record.duration || 0;

            // Find or create date entry
            let dateEntry = acc.find(item => item.date === date);
            if (!dateEntry) {
                dateEntry = { date, members: [] };
                acc.push(dateEntry);
            }

            // Find or create user entry
            let userEntry = dateEntry.members.find(member => member.name === user);
            if (!userEntry) {
                userEntry = { name: user, tasks: [] };
                dateEntry.members.push(userEntry);
            }

            // Add task
            userEntry.tasks.push({
                title: taskTitle,
                duration
            });

            return acc;
        }, []);

        res.status(200).json({ data: formattedData });

    } catch (error) {
        console.error("Error getting time tracking report:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Check active tracking
exports.getActiveTracking = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { email: decodedToken.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const tracking = await TaskTimeTracking.findOne({
            where: {
                user_id: user.user_id,
                end_time: null
            },
            include: [
                {
                    model: Task,
                    as: 'task',
                    attributes: ['title', 'task_id']
                }
            ]
        });

        res.status(200).json({
            data: tracking,
            isTracking: !!tracking
        });

    } catch (error) {
        console.error("Error getting active tracking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getMissedTracker = async (req, res) => {
    const userId = req.user.user_id;
  
    try {
      const missedTracker = await TaskTimeTracking.findOne({
        where: {
          user_id: userId,
          status: "missed",
        },
        order: [["start_time", "DESC"]],
      });
  
      if (missedTracker) {
        return res.status(200).json({
          error: true,
          message: "You have a missed tracker from previous day.",
          tracker: missedTracker,
        });
      }
  
      res.status(200).json({ error: false, message: "No missed tracker found." });
    } catch (error) {
      res.status(500).json({ error: true, message: "Server error", details: error });
    }
};