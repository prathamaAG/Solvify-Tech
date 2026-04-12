const { User } = require("../Database/config");

/**
 * Get all subordinate user IDs for a given manager (recursive).
 * Traverses the reporting_person_id chain downward.
 * 
 * Example: If A manages B, and B manages C, then
 *   getSubordinateIds(A.user_id) → [B.user_id, C.user_id]
 */
async function getSubordinateIds(managerId, visited = new Set()) {
    if (visited.has(managerId)) return []; // Prevent circular loops
    visited.add(managerId);

    const directReports = await User.findAll({
        where: { reporting_person_id: managerId },
        attributes: ["user_id"],
        raw: true,
    });

    let allSubIds = directReports.map(u => u.user_id);

    // Recursively get subordinates of subordinates
    for (const sub of directReports) {
        const deepSubs = await getSubordinateIds(sub.user_id, visited);
        allSubIds = allSubIds.concat(deepSubs);
    }

    return allSubIds;
}

/**
 * Check if `managerId` is a superior of `targetUserId` in the hierarchy.
 */
async function isSuperiorOf(managerId, targetUserId) {
    if (managerId === targetUserId) return true; // Same person
    const subordinates = await getSubordinateIds(managerId);
    return subordinates.includes(targetUserId);
}

/**
 * Determine the permission level for a user regarding a task.
 * Returns: 'admin' | 'superior' | 'self' | 'denied'
 * 
 * - admin: full control on any task
 * - superior: user is a manager/senior of the task's assignee → can create/move/assign/delete
 * - self: user is the assignee → can move their own task
 * - denied: no permission
 */
async function getTaskPermission(user, task) {
    if (user.role === "admin") return "admin";
    if (!task.assign_to) return "unassigned"; // New state for newly created tasks
    if (task.assign_to === user.user_id) return "self";
    if (task.assign_to && await isSuperiorOf(user.user_id, task.assign_to)) return "superior";
    return "denied";
}

module.exports = {
    getSubordinateIds,
    isSuperiorOf,
    getTaskPermission,
};
