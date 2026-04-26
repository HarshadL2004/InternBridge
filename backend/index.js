require('dotenv').config()
const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const setupResumeRoutes = require('./routes/resumeRoutes');
const app = express();
const port = process.env.PORT || 5001;


app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// mongodb connection 


// const verifyToken=(req,res,next)=>{
//   const token=req?.cookies?.token
//   if(!token){
//     return res.send({massage:'unothoris'})
//   }
//   jwt.verify(token,'AD42AEEC73759E8F49FD2B96FF936B0C1D920B5B3D3E6E769281928EB538D1C2',(err,decode)=>{
//     if(err){
//       return res.send({massage:'again login'})
//     }
//     req.user=decode
//     next()
//   }) LearnBridge

// }


const uri = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@showtime.zkml8ci.mongodb.net/intern?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const database = client.db("intern"); // Changed from JobPortal to match URI
    const userCollection = database.collection('user')
    const jobCollection = database.collection('internship')
    const applicationCollection = database.collection('application')

    console.log("Connected to 'intern' database successfully");

    app.get('/', (req, res) => {
      res.send({ messge: 'Job portal is working perfectly' })
    })

    // --- User Routes ---
    app.post('/add_user', async (req, res) => {
      try {
        console.log("Adding user:", req.body)
        const result = await userCollection.insertOne(req.body)
        res.send(result)
      } catch (error) {
        console.error("Add user error:", error);
        res.status(500).send({ error: error.message });
      }
    })

    app.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await userCollection.findOne({ email, password });
        if (user) {
          res.send({ success: true, user: { email: user.email, role: user.role } });
        } else {
          res.send({ success: false, message: 'Invalid credentials' });
        }
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ error: error.message });
      }
    })

    app.get('/users', async (req, res) => {
      try {
        const users = await userCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).send({ error: error.message });
      }
    })

    // --- Internship Routes ---
    app.get('/internships/company/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const internships = await jobCollection.find({ email: email }).toArray();
        res.send(internships);
      } catch (error) {
        console.error("Fetch company internships error:", error);
        res.status(500).send({ error: error.message });
      }
    })

    app.post('/add_internship', async (req, res) => {
      try {
        const jobInfo = req.body
        console.log("Adding internship:", jobInfo)
        const result = await jobCollection.insertOne(jobInfo)
        res.send(result)
      } catch (error) {
        console.error("Add internship error:", error);
        res.status(500).send({ error: error.message });
      }
    })

    app.get("/internships", async (req, res) => {
      try {
        const jobs = await jobCollection.find().toArray();
        res.send(jobs);
      } catch (error) {
        console.error("Fetch internships error:", error);
        res.status(500).send({ error: error.message });
      }
    });

    app.get("/internships/search", async (req, res) => {
      try {
        const { title, role } = req.query;
        let query = {};
        if (title) {
          query.title = { $regex: title, $options: "i" };
        } else if (role) {
          query.role = { $regex: role, $options: "i" };
        }
        const jobs = await jobCollection.find(query).toArray();
        res.send(jobs);
      } catch (error) {
        console.error("Search internships error:", error);
        res.status(500).send({ error: error.message });
      }
    });

    app.get('/internship/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // If it's an external job ID (starts with arbeit-), we don't look it up in local DB
        if (id.startsWith('arbeit-')) {
          return res.status(404).json({ error: "External job details must be fetched from API" });
        }

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid job ID" });
        }
        const job = await jobCollection.findOne({ _id: new ObjectId(id) });
        if (!job) {
          return res.status(404).json({ error: "Job not found" });
        }
        res.json(job);
      } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    })

    app.delete('/internship/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ success: false, message: "Invalid ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await jobCollection.deleteOne(query);
        if (result.deletedCount > 0) {
          // Delete all applications related to this job
          await applicationCollection.deleteMany({ jobId: id });
          res.send({ success: true, message: "Job and related applications deleted successfully" });
        } else {
          res.status(404).send({ success: false, message: "Job not found" });
        }
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
      }
    });

    app.put('/internship/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ success: false, message: "Invalid ID" });
        }
        const { _id, ...updatedJob } = req.body;
        const result = await jobCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedJob }
        );
        if (result.modifiedCount > 0) {
          res.send({ success: true, message: "Job updated successfully" });
        } else {
          res.status(404).send({ success: false, message: "No changes made or job not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal server error" });
      }
    });

    // --- Application Routes ---
    app.post('/apply_internship', async (req, res) => {
      try {
        const application = req.body;
        
        if (!application.jobId || !application.studentEmail) {
          return res.status(400).send({ success: false, message: "Job ID and Student Email are required" });
        }

        console.log("Processing application:", application);
        
        // Check if already applied
        const existing = await applicationCollection.findOne({
          jobId: application.jobId,
          studentEmail: application.studentEmail
        });

        if (existing) {
          return res.send({ success: false, message: "You have already applied for this internship" });
        }

        const result = await applicationCollection.insertOne({
          ...application,
          appliedDate: new Date()
        });
        res.send({ success: true, result });
      } catch (error) {
        console.error("Apply internship error:", error);
        res.status(500).send({ error: error.message });
      }
    });

    app.get('/applications/student/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const applications = await applicationCollection.find({ studentEmail: email }).toArray();
        
        // Since some jobs are local (ObjectIDs) and some are external (Strings),
        // we'll fetch details for local ones and return the rest as is.
        const detailedApplications = await Promise.all(applications.map(async (app) => {
          if (app.jobId && app.jobId.startsWith('arbeit-')) {
            return {
              ...app,
              jobDetails: {
                _id: app.jobId,
                title: app.jobTitle || "External Internship",
                email: app.jobCompany || "External Provider",
                external: true
              }
            };
          } else if (app.jobId && ObjectId.isValid(app.jobId)) {
            const job = await jobCollection.findOne({ _id: new ObjectId(app.jobId) });
            if (!job) return null; // Filter out if job deleted
            return { 
              ...app, 
              jobDetails: job
            };
          } else {
            return null; // Invalid ID
          }
        })).then(results => results.filter(Boolean));

        res.send(detailedApplications);
      } catch (error) {
        console.error("Fetch student applications error:", error);
        res.status(500).send([]); // Return empty array on error to prevent frontend crash
      }
    });

    app.get('/applications/job/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const applications = await applicationCollection.find({ jobId: id }).toArray();
        res.send(applications);
      } catch (error) {
        console.error("Fetch job applications error:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // --- College Stats Route ---
    app.get('/college/stats', async (req, res) => {
      try {
        const studentList = await userCollection.find({ role: 'Student' }).toArray();
        const companyList = await userCollection.find({ role: 'Company' }).toArray();
        const applicationCount = await applicationCollection.estimatedDocumentCount();
        
        res.send({
          studentCount: studentList.length,
          companyCount: companyList.length,
          applicationCount,
          studentList,
          companyList
        });
      } catch (error) {
        console.error("Fetch college stats error:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // --- ATS Resume Routes ---
    const resumeRouter = setupResumeRoutes(database);
    app.use('/api/resume', resumeRouter);

















    // app.post('/jwt',async(req,res)=>{
    //   const user =req.body

    //   const token =jwt.sign(user,'AD42AEEC73759E8F49FD2B96FF936B0C1D920B5B3D3E6E769281928EB538D1C2',{expiresIn:'1h'})
    //   res
    //   .cookie('token',token,{
    //     httpOnly:true,
    //     secure:false
    //   })
    //   .send({success:true})
    // })









    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
run();

app.get('/', (req, res) => {
  res.send("This is Learn Bridge Server")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
