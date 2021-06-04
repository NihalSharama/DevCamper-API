const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const path = require('path');
const geocoder = require('../utils/geocoder');
const dotenv = require('dotenv');
const asyncHandler = require('../middleware/async');

dotenv.config({ path: './config/config.env' });

//@desc Get all bootcamps
//@route Get /api/v1/bootcamps
//access Public
exports.getbootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
//@desc Get A bootcamps
//@route Get /api/v1/bootcamps/:id
//access Public
exports.getbootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});
//@desc Create A bootcamps
//@route Get /api/v1/bootcamps/
//access Private
exports.createbootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req, body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the user is not admin they can add only one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id '${req.user.id}' has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc Update A bootcamps
//@route Get /api/v1/bootcamps/:id
//access Private
exports.updatebootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Only owner of bootcamp id: ${req.params.id} can update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc delete A bootcamps
//@route Get /api/v1/bootcamps/:id
//access Private
exports.deletebootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Only owner of bootcamp id: ${req.params.id} can delete this bootcamp`,
        401
      )
    );
  }

  // it will call our middleware
  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

//@desc get bootcamps neer me
//@route Get /api/v1/bootcamps/radius/:zipcode/:distance
//access Public
exports.getbootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lag/lat
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc Radius using radians
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc upload photo to bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
//access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Only owner of bootcamp id: ${req.params.id} can update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an photo', 400));
  }

  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an photo of less than ${process.env.MAX_FILE_SIZE}`,
        400
      )
    );
  }

  // Creating custom filename
  file.name = `photo${bootcamp._id}${path.parse(file.name).ext}`;

  //uploading file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`file couldn't uploade`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
