const jwt = require("jsonwebtoken");
const { Meeting, Project, User, ProjectMembers, Notification } = require("../Database/config");
const { Op } = require("sequelize");

// POST /api/meeting/create — Admin creates a meeting for a project
exports.createMeeting = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ status: 0, message: "User not found" });
        if (user.role !== "admin") return res.status(403).json({ status: 0, message: "Only admins can schedule meetings" });

        const { project_id, title, description, meeting_date, start_time, end_time, meeting_link } = req.body;

        // Validate project exists
        const project = await Project.findOne({ where: { project_id } });
        if (!project) return res.status(404).json({ status: 0, message: "Project not found" });

        const meeting = await Meeting.create({
            project_id,
            title,
            description,
            scheduled_by: user.user_id,
            meeting_date,
            start_time,
            end_time,
            meeting_link: meeting_link || null,
        });

        // Send notifications to all project members
        try {
            const members = await ProjectMembers.findAll({ where: { project_id } });
            const formattedDate = new Date(meeting_date).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });

            for (const member of members) {
                if (member.user_id !== user.user_id) {
                    await Notification.create({
                        user_id: member.user_id,
                        type: 'meeting_scheduled',
                        title: 'Meeting Scheduled',
                        message: `"${title}" scheduled for ${formattedDate} at ${start_time} in project "${project.project_name}".`,
                        reference_id: meeting.meeting_id,
                        is_read: false
                    });
                }
            }
        } catch (notifErr) {
            console.error("Error sending meeting notifications:", notifErr);
        }

        res.status(201).json({
            status: 1,
            message: "Meeting scheduled successfully",
            data: meeting,
        });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// GET /api/meeting/ — Get all meetings for user (via project membership)
exports.getMeetings = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ status: 0, message: "User not found" });

        // Get all project IDs user is a member of
        const memberships = await ProjectMembers.findAll({
            where: { user_id: user.user_id },
            attributes: ['project_id']
        });
        const projectIds = memberships.map(m => m.project_id);

        // If admin, also include all projects
        let allProjectIds = projectIds;
        if (user.role === 'admin') {
            const allProjects = await Project.findAll({ attributes: ['project_id'] });
            allProjectIds = [...new Set([...projectIds, ...allProjects.map(p => p.project_id)])];
        }

        const meetings = await Meeting.findAll({
            where: {
                project_id: { [Op.in]: allProjectIds },
                meeting_date: { [Op.gte]: new Date().toISOString().split('T')[0] }
            },
            include: [
                { model: Project, attributes: ['project_id', 'project_name'] },
                { model: User, as: 'Scheduler', attributes: ['user_id', 'name', 'email'] }
            ],
            order: [['meeting_date', 'ASC'], ['start_time', 'ASC']]
        });

        res.status(200).json({
            status: 1,
            message: "Meetings fetched successfully",
            data: meetings,
        });
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// GET /api/meeting/project/:project_id — Get meetings for a specific project
exports.getProjectMeetings = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ status: 0, message: "User not found" });

        const { project_id } = req.params;

        const meetings = await Meeting.findAll({
            where: { project_id },
            include: [
                { model: Project, attributes: ['project_id', 'project_name'] },
                { model: User, as: 'Scheduler', attributes: ['user_id', 'name', 'email'] }
            ],
            order: [['meeting_date', 'ASC'], ['start_time', 'ASC']]
        });

        res.status(200).json({
            status: 1,
            message: "Project meetings fetched",
            data: meetings,
        });
    } catch (error) {
        console.error("Error fetching project meetings:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};

// DELETE /api/meeting/:meeting_id — Admin deletes a meeting
exports.deleteMeeting = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { email: decodedToken.email } });
        if (!user) return res.status(404).json({ status: 0, message: "User not found" });
        if (user.role !== "admin") return res.status(403).json({ status: 0, message: "Only admins can delete meetings" });

        const { meeting_id } = req.params;
        const meeting = await Meeting.findOne({ where: { meeting_id } });
        if (!meeting) return res.status(404).json({ status: 0, message: "Meeting not found" });

        await meeting.destroy();

        res.status(200).json({
            status: 1,
            message: "Meeting deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting meeting:", error);
        res.status(500).json({ status: 0, message: "Server error", error: error.message });
    }
};
