const express = require('express');
const router = express.Router();

const movie = require("../controllers/movie.controller")
const schedule = require("../controllers/schedule.controller")
const seat = require("../controllers/seat.controller")
const receipt = require("../controllers/receipt.controller")
const user = require("../controllers/user.controller")
const ticket = require("../controllers/ticket.controller")
const booking = require("../controllers/booking.controller")

router.get("/movies", movie.getMultiple)
router.get("/movies/:movieId", movie.getById)

router.get("/schedule", schedule.get)

router.get("/seat", seat.get)
router.get("/seat/valid", seat.valid)
router.post("/seat/select", seat.selectSeat)
router.post("/seat/unselect", seat.unSelectSeat)
router.get("/seat/tickets", seat.getTempTicket)
router.post("/seat/book", seat.book)

router.get("/receipt", receipt.gets)
router.get("/receipt/item", receipt.get)

router.get("/ticket", ticket.gets)
router.get("/ticket/item", ticket.get)

router.get("/bookings", booking.getMultiple)
router.get("/bookings/:id", booking.getById)

router.post("/auth", user.auth)
router.post("/user", user.insertUser)

module.exports = router;