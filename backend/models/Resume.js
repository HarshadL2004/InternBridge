// Resume Model Schema for MongoDB
// This schema stores ATS resume analysis results

const resumeSchema = {
  userId: String,
  score: Number,
  grade: String,
  feedback: String,
  skills_found: {
    programming: [String],
    web: [String],
    database: [String],
    cloud: [String],
    data: [String],
    soft: [String]
  },
  completeness: {
    contact_info: Boolean,
    summary: Boolean,
    experience: Boolean,
    education: Boolean,
    skills: Boolean,
    certifications: Boolean
  },
  keyword_density: Object,
  suggestions: [String],
  metrics: {
    total_skills: Number,
    completeness_percentage: Number,
    content_quality: Number,
    keyword_optimization: Number
  },
  createdAt: { $date: new Date() },
  updatedAt: { $date: new Date() }
};

module.exports = resumeSchema;
