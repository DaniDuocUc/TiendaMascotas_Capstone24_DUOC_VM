const { isValidISO8601 } = require('../utils/dateUtils');

const areBothTimesProvidedOrNone = (start_time, end_time) => {
  return (start_time && end_time) || (!start_time && !end_time);
};

const setDefaultTimesForChile = req => {
  const now = new Date();
  const chileTimeOffset = 3 * 60 * 60 * 1000; // 3 hours
  const chileNow = new Date(now.getTime() - chileTimeOffset);
  const chileOneHourAgo = new Date(chileNow.getTime() - 60 * 60 * 1000);

  req.query.start_time = chileOneHourAgo.toISOString();
  req.query.end_time = chileNow.toISOString();
};

const isValidTimeRange = (startTime, endTime) => {
  const timeDifferenceMs = endTime.getTime() - startTime.getTime();
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);

  // 1 minute <= timeDifference <= 24 hours
  return timeDifferenceMinutes >= 1 && timeDifferenceMinutes <= 1440;
};

const validateAbsoluteTime = (req, res, next) => {
  let { start_time, end_time } = req.query;

  if (!areBothTimesProvidedOrNone(start_time, end_time)) {
    return res.status(400).send({
      message: 'Please provide both start_time and end_time, or leave both empty for the default time range.',
    });
  }

  if (!start_time && !end_time) {
    setDefaultTimesForChile(req);
    return next();
  }

  if (!isValidISO8601(start_time) || !isValidISO8601(end_time)) {
    return res.status(400).send({
      message: 'Invalid date format. Please provide dates in ISO 8601 format.',
    });
  }

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);

  if (!isValidTimeRange(startTime, endTime)) {
    return res.status(400).send({
      message: 'The time range must be between 1 minute and 24 hours.',
    });
  }

  next();
};

const validateRelativeTime = (req, res, next) => {
  const { seconds } = req.query;
  if (!seconds || isNaN(seconds)) {
    return res.status(400).send({
      message: 'The time range must be between 60 seconds (1 minute) and 86400 seconds (24 hours).',
    });
  }
  const secondsNumber = Number(seconds);
  if (secondsNumber < 60 || secondsNumber > 86400) {
    return res.status(400).send({
      message: 'The time range must be between 60 seconds (1 minute) and 86400 seconds (24 hours).',
    });
  }

  next();
};

const validateDateRange = maxDays => {
  return (req, res, next) => {
    const { start_date, end_date } = req.query;

    if (!areBothTimesProvidedOrNone(start_date, end_date)) {
      return res.status(400).send({
        message: 'Please provide both start_date and end_date.',
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send({
        message: 'Invalid date format. Use YYYY-MM-DD.',
      });
    }

    if (endDate < startDate) {
      return res.status(400).send({
        message: 'end_date must be greater than or equal to start_date.',
      });
    }

    const timeDifference = Math.abs(endDate - startDate);
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    if (daysDifference > maxDays) {
      return res.status(400).send({
        message: `The date range cannot exceed ${maxDays} days.`,
      });
    }
    next();
  };
};

module.exports = {
  validateAbsoluteTime,
  validateRelativeTime,
  validateDateRange,
};
