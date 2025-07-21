const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { ensureAuth, ensureRole } = require('../middleware/authMiddleware');

// List all jobs - visible to all logged in users
router.get('/', ensureAuth, async (req, res) => {
  const jobs = await Job.find({ status: 'open' });
  res.render('jobs/index', { jobs, user: req.session.user });
});

// Create job (clients only)
router.get('/create', ensureAuth, ensureRole('client'), (req, res) => {
  res.render('jobs/create');
});

router.post('/create', ensureAuth, ensureRole('client'), async (req, res) => {
  const { title, description, location } = req.body;
  const job = new Job({ title, description, location, postedBy: req.session.user.id });
  await job.save();
  res.redirect('/jobs');
});

// View job details & apply (workers only)
router.get('/:id', ensureAuth, async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy');
  if(!job) return res.status(404).send('Job not found');
  res.render('jobs/show', { job, user: req.session.user });
});

router.post('/:id/apply', ensureAuth, ensureRole('worker'), async (req, res) => {
  const jobId = req.params.id;
  const applicationExists = await Application.findOne({ job: jobId, applicant: req.session.user.id });
  if(applicationExists) {
    return res.redirect('/jobs/' + jobId);
  }
  const application = new Application({ job: jobId, applicant: req.session.user.id });
  await application.save();
  res.redirect('/jobs/' + jobId);
});

module.exports = router;
