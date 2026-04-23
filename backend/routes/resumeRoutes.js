const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { ObjectId } = require('mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Setup Resume Routes with MongoDB Database Connection
 * @param {Object} database - MongoDB database instance
 */
function setupResumeRoutes(database) {
  const resumeCollection = database.collection('resume');

  // Protected middleware - verify user token
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }
    // Add user to request (in production, verify JWT)
    req.user = { id: token }; // Simplified for now
    next();
  };

  /**
   * POST /api/resume/upload
   * Upload and analyze resume
   */
  router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      const form = new FormData();
      form.append('resume', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const headers = {
        ...form.getHeaders(),
      };

      // Call AI service for resume analysis
      const aiRes = await axios.post('http://127.0.0.1:8001/analyze', form, {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Save to database
      const resumeData = {
        userId: req.user.id,
        score: aiRes.data.score,
        grade: aiRes.data.grade,
        feedback: aiRes.data.feedback,
        skills_found: aiRes.data.skills_found,
        completeness: aiRes.data.completeness,
        keyword_density: aiRes.data.keyword_density,
        suggestions: aiRes.data.suggestions,
        metrics: aiRes.data.metrics,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await resumeCollection.insertOne(resumeData);

      res.json({
        _id: result.insertedId,
        ...resumeData,
      });
    } catch (error) {
      console.error('Upload error:', error.message);
      if (error.response) {
        console.error('AI service response status:', error.response.status);
        console.error('AI service response data:', error.response.data);
      }
      res.status(500).json({
        msg: error.response?.data?.detail || error.response?.data?.msg || error.message || 'Upload failed',
      });
    } finally {
      if (req.file?.path) {
        fs.unlink(req.file.path, (unlinkError) => {
          if (unlinkError) {
            console.warn('Could not delete temporary upload file:', unlinkError.message);
          }
        });
      }
    }
  });

  /**
   * GET /api/resume/history
   * Get user's resume analysis history
   */
  router.get('/history', verifyToken, async (req, res) => {
    try {
      const data = await resumeCollection
        .find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(data);
    } catch (error) {
      console.error('History fetch error:', error);
      res.status(500).json({ msg: 'Failed to fetch history' });
    }
  });

  /**
   * GET /api/resume/:id
   * Get specific resume analysis
   */
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const resume = await resumeCollection.findOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });
      
      if (!resume) {
        return res.status(404).json({ msg: 'Resume not found' });
      }
      
      res.json(resume);
    } catch (error) {
      console.error('Fetch resume error:', error);
      res.status(500).json({ msg: 'Failed to fetch resume' });
    }
  });

  /**
   * DELETE /api/resume/:id
   * Delete resume analysis
   */
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await resumeCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: 'Resume not found' });
      }
      
      res.json({ msg: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Delete resume error:', error);
      res.status(500).json({ msg: 'Failed to delete resume' });
    }
  });

  return router;
}

module.exports = setupResumeRoutes;
