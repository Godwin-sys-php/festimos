const router = require("express").Router();
const Events = require("../Controllers/Events");

// Send ticket to customer
router.post("/:slug", Events.getATicket);

// Scan ticket

// Get all the saled ticket of an event

module.exports = router;

