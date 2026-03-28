const express = require("express");
const router = express.Router();

const { authMiddleware: authenticateUser } = require("../Middleware/auth.middleware");
const cardController = require("../Controllers/card.controller");

router.get("/:project_id", authenticateUser, cardController.getCards);
router.post("/create", authenticateUser, cardController.createCard);
router.put("/update", authenticateUser, cardController.updateCard);
router.delete("/:card_id", authenticateUser, cardController.deleteCard);


module.exports = router;
