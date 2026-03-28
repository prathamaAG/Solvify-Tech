export const apiBase: Record<string, string> = {
    // Base URL
    apiUrl: import.meta.env.VITE_GATEWAY,

    // ==================== AUTHENTICATION ====================
    userLogin: "api/users/login",
    userSignUp: "api/users/signup",
    resendVerificationEmail: "api/users/resend-verification-email",
    verifyEmail: "api/users/verify-email",
    forgotPassword: "api/users/forgot-password",
    resetPassword: "api/users/reset-password",
    validateToken: "api/users/validate-token",
    adminCreateUser: "api/users/admin/create-user",
    deleteEmployee: "api/users/employees/",

    // ==================== EMPLOYEES ====================
    getAllEmployees: "api/users/employees",
    updateEmployee: "api/users/update",
    getEmployeeDropdownList: "api/users/employee-dropdown",
    getMySubordinates: "api/users/my-subordinates",
    getEmployeesData: "api/member/employee-data",

    // ==================== PROJECTS ====================
    createProject: "api/project/create",
    getAllProjects: "api/project/all-project",
    getProject: "api/project/",
    deleteProject: "api/project/",
    updateProject: "api/project",
    getUsersForMember: "api/project/getuser/formember",
    getProjectsData: "api/project/project-data",
    getProjectMembers: "api/project/get-project-members/",
    addProjectMembers: "api/project/add-member-to-project",
    removerProjectMembers: "api/project/remove-member-from-project",

    // ==================== CARDS ====================
    getCard: "api/card/",
    createCard: "api/card/create",
    updateCard: "api/card/update",
    deleteCard: "api/card/",

    // ==================== TASKS ====================
    getTask: "api/task/",
    createTask: "api/task/create",
    deleteTask: "api/task/",
    updateTask: "api/task",
    updateTaskPosition: "api/task/tasks/updateTaskPosition",
    getTasksData: "api/task/tasks/data",
    getTaskDetails: "api/task/task-details/",
    getUserTasks: "api/task/user/tasks",
    getAdminTasks: "api/task/admin/tasks",

    // ==================== COMMENTS ====================
    createComment: "api/comment/create",
    getComments: "api/comment/task/",

    // ==================== MEMBERS ====================
    getUsers: "api/member",

    // ==================== ORGANIZATION ====================
    getOrganizationTree: "api/organization-tree",
    getOrganizationHierarchy: "api/organization/hierarchy",
    getEmployeesByDepartment: "api/organization/department",

    // ==================== TIME TRACKING (ITERATION 3) ====================
    // Use these keys in MyTask component
    startTimeTracking: "api/task-time-tracking/start",
    stopTimeTracking: "api/task-time-tracking/stop",
    getActiveTimeTracking: "api/task-time-tracking/active",
    getReportTimeTracking: "api/task-time-tracking/report",
    getMissedTracker: "api/task-time-tracking/missed-tracker",

    // ==================== MANUAL TIME REQUEST (ITERATION 3) ====================
    submitManualTimeTracking: "api/manualTrackerRequest/manual-request/send",
    getAllManualTimeRequests: "api/manualTrackerRequest/manual-request/",
    updateManualTimeRequestStatus: "api/manualTrackerRequest/manual-request-action",

    // ==================== NOTIFICATIONS ====================
    getNotifications: "api/notification",
    getUnreadNotificationCount: "api/notification/unread-count",
    markNotificationRead: "api/notification/read/",
    markAllNotificationsRead: "api/notification/read-all",

    // ==================== MEETINGS ====================
    createMeeting: "api/meeting/create",
    getMeetings: "api/meeting",
    getProjectMeetings: "api/meeting/project/",
    deleteMeeting: "api/meeting/",

    // ==================== ACTIVITY TRACKING ====================
    sendHeartbeat: "api/activity/heartbeat",
    getActivityReport: "api/activity/report/",
    getActivitySummary: "api/activity/summary",

    // ==================== AI ANALYTICS ====================
    getAIAnalytics: "api/ai/analytics",
};
