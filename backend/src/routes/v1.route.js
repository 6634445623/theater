const express = require('express');
const router = express.Router();

const movie = require("../controllers/movie.controller")
const schedule = require("../controllers/schedule.controller")
const seat = require("../controllers/seat.controller")
const receipt = require("../controllers/receipt.controller")
const user = require("../controllers/user.controller")
const ticket = require("../controllers/ticket.controller")
const booking = require("../controllers/booking.controller")
const zone = require("../controllers/zone.controller")
const theatre = require("../controllers/theatre.controller")
const { authenticateJWT } = require("../middlewares/auth.middleware")

router.get("/movies", movie.getMultiple)
router.get("/movies/:movieId", movie.getById)
router.post("/movies", authenticateJWT, movie.create)
router.put("/movies/:movieId", authenticateJWT, movie.update)
router.delete("/movies/:movieId", authenticateJWT, movie.remove)

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

router.get("/bookings", authenticateJWT, booking.getMultiple)
router.get("/bookings/all", authenticateJWT, booking.getAllBookings)
router.get("/bookings/:id", booking.getById)

router.post("/auth", user.auth)
router.post("/user", user.insertUser)

// Zone routes
router.get("/zones", authenticateJWT, zone.getAll)
router.post("/zones", authenticateJWT, zone.create)
router.put("/zones/:id", authenticateJWT, zone.update)
router.delete("/zones/:id", authenticateJWT, zone.remove)

// Theatre routes
router.get("/theatres", authenticateJWT, theatre.getAll)
router.post("/theatres", authenticateJWT, theatre.create)
router.put("/theatres/:id", authenticateJWT, theatre.update)
router.delete("/theatres/:id", authenticateJWT, theatre.remove)

module.exports = router;