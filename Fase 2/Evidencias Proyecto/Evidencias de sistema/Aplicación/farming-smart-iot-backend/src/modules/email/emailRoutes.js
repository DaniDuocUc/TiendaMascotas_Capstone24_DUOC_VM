const express = require('express');
const multer = require('multer');
const { sendEmailController } = require('./emailController');
const { validateEmailData } = require('../../middlewares/validateEmailData');

const router = express.Router();

// Multer setup
const upload = multer({ dest: 'uploads/' });

router.post('/email/send', upload.single('attachment'), validateEmailData, sendEmailController);

module.exports = router;
