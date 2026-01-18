const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Razorpay = require("razorpay");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Initialize Razorpay (lazy/guarded to avoid throwing when keys are missing)
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn("Razorpay keys not set — payment features disabled");
  }
} catch (err) {
  console.warn(
    "Razorpay initialization failed:",
    err && err.message ? err.message : err,
  );
  razorpay = null;
}

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // Calculate total amount
    const totalAmount = seats.reduce((total, seat) => {
      const seatInfo = show.availableSeats.find(
        (s) => s.row === seat.row && s.number === seat.number,
      );
      return total + (seatInfo ? seatInfo.price : 0);
    }, 0);

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      show: showId,
      seats,
      totalAmount,
      paymentStatus: "pending",
    });

    await booking.save();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      receipt: booking._id.toString(),
    });

    res.json({
      booking,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { paymentId, signature } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify payment
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(booking._id + "|" + paymentId)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update booking status
    booking.paymentStatus = "completed";
    booking.paymentId = paymentId;

    // Generate tickets
    const tickets = await Promise.all(
      booking.seats.map(async (seat) => {
        const ticketNumber = `TKT${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
        const qrCode = await QRCode.toDataURL(ticketNumber);

        return {
          ticketNumber,
          qrCode,
          seat: {
            row: seat.row,
            number: seat.number,
          },
        };
      }),
    );

    booking.tickets = tickets;
    await booking.save();

    // Send confirmation email
    await transporter.sendMail({
      to: req.user.email,
      subject: "Booking Confirmation",
      html: `
                <h1>Booking Confirmed!</h1>
                <p>Your booking has been confirmed. Here are your ticket details:</p>
                <ul>
                    ${tickets
                      .map(
                        (ticket) => `
                        <li>
                            Ticket Number: ${ticket.ticketNumber}<br>
                            Seat: ${ticket.seat.row}${ticket.seat.number}
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
                <p>Thank you for booking with us!</p>
            `,
    });

    res.json({ message: "Payment successful", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("show")
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("show");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.paymentStatus !== "completed") {
      return res.status(400).json({ message: "Cannot cancel unpaid booking" });
    }

    // Process refund
    await razorpay.payments.refund(booking.paymentId, {
      amount: booking.totalAmount * 100,
    });

    booking.paymentStatus = "refunded";
    booking.isActive = false;
    await booking.save();

    res.json({ message: "Booking cancelled and refund processed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
