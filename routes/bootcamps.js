const express = require('express');
const router = express.Router();

const {
  getbootcamps,
  getbootcamp,
  createbootcamp,
  updatebootcamp,
  deletebootcamp,
  getbootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controlers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resourses
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const { protect, authorize } = require('../middleware/auth');

//  re-route into other resourses
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getbootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getbootcamps)
  .post(protect, authorize('publisher', 'admin'), createbootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);
router
  .route('/:id')
  .get(getbootcamp)
  .put(protect, authorize('publisher', 'admin'), updatebootcamp)
  .delete(protect, authorize('publisher', 'admin'), deletebootcamp);

module.exports = router;
