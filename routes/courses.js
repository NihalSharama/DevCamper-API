const express = require('express');
const Courses = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

const {
  getCourses,
  getCourse,
  AddCourse,
  UpdateCourse,
  DeleteCourse,
} = require('../controlers/courses');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Courses, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), AddCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), UpdateCourse)
  .delete(protect, authorize('publisher', 'admin'), DeleteCourse);

module.exports = router;
