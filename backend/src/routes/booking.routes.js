"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timeslot_controller_1 = require("../controllers/timeslot.controller");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const booking_schema_1 = require("../schemas/booking.schema");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All booking routes require authentication
router.use(auth_1.authenticate);
// ===== TIMESLOT ROUTES =====
// GET /api/timeslots - получить список временных слотов
router.get('/timeslots', (0, validate_1.validate)(zod_1.z.object({ query: booking_schema_1.getTimeSlotsParamsSchema })), timeslot_controller_1.getTimeSlots);
// GET /api/timeslots/:id - получить конкретный временной слот
router.get('/timeslots/:id', (0, validate_1.validate)(zod_1.z.object({ params: booking_schema_1.timeSlotIdParamSchema })), timeslot_controller_1.getTimeSlotById);
// POST /api/timeslots - создать новый временной слот
router.post('/timeslots', (0, validate_1.validate)(zod_1.z.object({ body: booking_schema_1.createTimeSlotSchema })), timeslot_controller_1.createTimeSlot);
// PATCH /api/timeslots/:id - обновить временной слот
router.patch('/timeslots/:id', (0, validate_1.validate)(zod_1.z.object({
    params: booking_schema_1.timeSlotIdParamSchema,
    body: booking_schema_1.updateTimeSlotSchema,
})), timeslot_controller_1.updateTimeSlot);
// DELETE /api/timeslots/:id - удалить временной слот
router.delete('/timeslots/:id', (0, validate_1.validate)(zod_1.z.object({ params: booking_schema_1.timeSlotIdParamSchema })), timeslot_controller_1.deleteTimeSlot);
// ===== BOOKING ROUTES =====
// GET /api/bookings - получить список бронирований пользователя
router.get('/bookings', (0, validate_1.validate)(zod_1.z.object({ query: booking_schema_1.getBookingsParamsSchema })), booking_controller_1.getBookings);
// GET /api/bookings/interviewer - получить список бронирований интервьюера
router.get('/bookings/interviewer', (0, validate_1.validate)(zod_1.z.object({ query: booking_schema_1.getBookingsParamsSchema })), booking_controller_1.getInterviewerBookings);
// GET /api/bookings/:id - получить конкретное бронирование
router.get('/bookings/:id', (0, validate_1.validate)(zod_1.z.object({ params: booking_schema_1.bookingIdParamSchema })), booking_controller_1.getBookingById);
// POST /api/bookings - создать новое бронирование
router.post('/bookings', (0, validate_1.validate)(zod_1.z.object({ body: booking_schema_1.createBookingSchema })), booking_controller_1.createBooking);
// PATCH /api/bookings/:id/cancel - отменить бронирование
router.patch('/bookings/:id/cancel', (0, validate_1.validate)(zod_1.z.object({
    params: booking_schema_1.bookingIdParamSchema,
    body: booking_schema_1.cancelBookingSchema,
})), booking_controller_1.cancelBooking);
// PATCH /api/bookings/:id/confirm - подтвердить бронирование (для интервьюера)
router.patch('/bookings/:id/confirm', (0, validate_1.validate)(zod_1.z.object({ params: booking_schema_1.bookingIdParamSchema })), booking_controller_1.confirmBooking);
exports.default = router;
