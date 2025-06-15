"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interview_controller_1 = require("../controllers/interview.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All interview routes require authentication
router.use(auth_1.authenticate);
// Interview routes
router.get('/', interview_controller_1.getInterviews);
router.get('/feedback', interview_controller_1.getInterviewFeedback);
router.post('/', interview_controller_1.createInterview);
router.patch('/:id', interview_controller_1.updateInterview);
router.delete('/:id', interview_controller_1.deleteInterview);
exports.default = router;
