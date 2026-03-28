const express = require("express");
const router = express.Router();

const organizationController = require("../Controllers/organization.controller");


router.get("/", organizationController.getOrganizationTree);

module.exports = router;
