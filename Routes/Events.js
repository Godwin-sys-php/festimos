const router = require("express").Router();
const Events = require("../Controllers/Events");

// Send ticket to customer
router.get("/:slug", Events.getATicket);
router.get("/:slug/decline", Events.fail);

// Scan ticket

// Get all the saled ticket of an event

module.exports = router;

