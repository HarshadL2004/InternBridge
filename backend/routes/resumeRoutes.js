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
    console.log('Token received:', token.substring(0, 20) + '...');
    // Add user to request (in production, verify JWT)
    req.user = { id: token }; // Simplified for now
    req.userToken = token;
    next();
  };

  /**
   * POST /api/resume/test-upload
   * Test endpoint - Upload without AI analysis
   */
  router.post('/test-upload', verifyToken, upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      console.log('Test upload received:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        userId: req.user.id.substring(0, 20) + '...'
      });

      // Save test data to database
      const testData = {
        userId: req.user.id,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        score: 85,
        grade: 'A',
        feedback: 'Test upload successful',
        skills_found: [],
        completeness: 100,
        keyword_density: 0,
        suggestions: [],
        metrics: { total_skills: 0, completeness_percentage: 100 },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await resumeCollection.insertOne(testData);

      res.json({
        _id: result.insertedId,
        ...testData,
        message: 'Test upload successful. Database connection is working!'
      });
    } catch (error) {
      console.error('=== TEST UPLOAD ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({
        msg: error.message || 'Test upload failed',
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
   * POST /api/resume/upload
   * Upload and analyze resume
   */
  router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
    const startTime = Date.now();
    let fileDeleted = false;
    
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      console.log(`[${new Date().toISOString()}] Starting resume upload...`);
      console.log('File details:', {
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        mimetype: req.file.mimetype
      });

      const form = new FormData();
      form.append('resume', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const headers = {
        ...form.getHeaders(),
      };

      // Call AI service for resume analysis
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
      console.log(`[${new Date().toISOString()}] Calling AI service at:`, aiServiceUrl);
      console.log('Request headers:', Object.keys(headers));
      
      let aiRes;
      try {
        aiRes = await axios.post(`${aiServiceUrl}/analyze`, form, {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000, // 60 second timeout
        });
      } catch (axiosError) {
        console.error(`[${new Date().toISOString()}] AI Service Error:`, {
          code: axiosError.code,
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          url: axiosError.config?.url
        });
        throw axiosError;
      }

      console.log('AI service response received successfully');
      console.log('AI Response data keys:', Object.keys(aiRes.data));

      // Save to database
      const resumeData = {
        userId: req.user.id,
        score: aiRes.data.score || 0,
        grade: aiRes.data.grade || 'N/A',
        feedback: aiRes.data.feedback || '',
        skills_found: aiRes.data.skills_found || [],
        completeness: aiRes.data.completeness || 0,
        keyword_density: aiRes.data.keyword_density || 0,
        suggestions: aiRes.data.suggestions || [],
        metrics: aiRes.data.metrics || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await resumeCollection.insertOne(resumeData);
      console.log(`[${new Date().toISOString()}] Resume saved to database with ID:`, result.insertedId);

      res.json({
        _id: result.insertedId,
        ...resumeData,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] === UPLOAD ERROR ===`);
      console.error('Error type:', error.code || error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('AI service response status:', error.response.status);
        console.error('AI service response data:', JSON.stringify(error.response.data));
        console.error('AI service response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received from AI service');
        console.error('Request config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        });
      } else {
        console.error('Error details:', error.stack);
      }
      
      let userMsg = 'Upload failed';
      
      if (error.code === 'ECONNREFUSED') {
        userMsg = 'Cannot connect to AI service. Service may be offline.';
      } else if (error.code === 'ENOTFOUND') {
        userMsg = 'AI service URL not found. Check AI_SERVICE_URL configuration.';
      } else if (error.message?.includes('timeout')) {
        userMsg = 'AI service took too long to respond. Please try again.';
      } else if (error.response?.status === 404) {
        userMsg = 'AI service endpoint not found. Check if /analyze endpoint exists.';
      } else if (error.response?.status === 400) {
        userMsg = 'Invalid resume format. Ensure the file is a valid PDF.';
      } else if (error.response?.status === 413) {
        userMsg = 'File too large. Maximum size exceeded.';
      } else {
        userMsg = error.response?.data?.detail || 
                  error.response?.data?.msg || 
                  error.message || 
                  'Upload failed';
      }
      
      res.status(500).json({
        msg: userMsg,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        aiServiceUrl: process.env.AI_SERVICE_URL || 'Not configured',
        duration: Date.now() - startTime + 'ms'
      });
    } finally {
      if (req.file?.path && !fileDeleted) {
        fs.unlink(req.file.path, (unlinkError) => {
          if (unlinkError) {
            console.warn('Could not delete temporary upload file:', unlinkError.message);
          } else {
            fileDeleted = true;
            console.log('Temporary file deleted');
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
