/**
 * ENHANCED DASHBOARD COMPONENT - ATS Resume Analyzer
 * Integrated with Job Portal | Job Portal Green Theme
 * Copy these sections into your Dashboard.jsx
 */

import React from "react";
import { useEffect, useState } from "react";
import { uploadResume, getHistory } from "../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PolarAreaController,
  PieController,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, PolarArea, Pie } from 'react-chartjs-2';

// IMPORT CHART CONFIGURATION
import {
  lineChartOptions,
  barChartOptions,
  doughnutChartOptions,
  radarChartOptions,
  polarChartOptions,
  colorPalette,
  gradeColors,
  skillCategoryColors,
  normalizeData,
  calculatePercentage,
  validateChartData
} from '../utils/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PolarAreaController,
  PieController,
  Filler
);

export default function Dashboard({ token }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    averageSkills: 0,
    averageCompleteness: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
  });

  const upload = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!file) {
        setError("Please select a file first");
        setLoading(false);
        return;
      }
      
      console.log('Starting upload with file:', file.name, 'Token:', token?.substring(0, 20) + '...');
      
      const res = await uploadResume(file, token);
      console.log('Upload response:', res.data);
      
      setResult(res.data);
      const h = await getHistory(token);
      setHistory(h.data);
      calculateStats(h.data);
    } catch (err) {
      console.error("Upload failed:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error config:", err.config);
      
      const errorMsg = err.response?.data?.msg || 
                       err.response?.data?.detail || 
                       err.message || 
                       "Upload failed. Please try again.";
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * IMPROVED STATS CALCULATION
   * Now includes more detailed metrics
   */
  const calculateStats = (data) => {
    const total = data.length;
    
    // Calculate averages
    const avgScore = total > 0 ? data.reduce((sum, item) => sum + (item.score || 0), 0) / total : 0;
    const avgSkills = total > 0 ? data.reduce((sum, item) => sum + (item.metrics?.total_skills || 0), 0) / total : 0;
    const avgCompleteness = total > 0 ? data.reduce((sum, item) => sum + (item.metrics?.completeness_percentage || 0), 0) / total : 0;

    // Calculate grade distribution - IMPROVED HANDLING
    const grades = { 
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0 
    };
    
    data.forEach(item => {
      const grade = item.grade || 'F';
      if (grades.hasOwnProperty(grade)) {
        grades[grade] = (grades[grade] || 0) + 1;
      }
    });

    setStats({
      totalResumes: total,
      averageScore: Math.round(avgScore),
      averageSkills: Math.round(avgSkills),
      averageCompleteness: Math.round(avgCompleteness),
      gradeDistribution: grades
    });
  };

  useEffect(() => {
    if (!token) return;
    getHistory(token)
      .then(r => {
        setHistory(r.data);
        calculateStats(r.data);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.reload();
        }
      });
  }, [token]);

  /**
   * IMPROVED ATS SCORE TREND CHART
   * Uses enhanced chart options and data normalization
   */
  const chartData = {
    labels: history.slice(-10).map((_, i) => `Resume ${i + 1}`),
    datasets: [{
      label: 'ATS Score',
      data: normalizeData(history.slice(-10).map(h => h.score || 0), 0, 100),
      borderColor: colorPalette.primary,
      backgroundColor: colorPalette.primaryLight,
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: colorPalette.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colorPalette.primary,
      pointHoverBorderWidth: 3,
    }]
  };

  /**
   * IMPROVED GRADE DISTRIBUTION CHART
   * Shows accurate grade breakdown with proper colors
   */
  const gradeData = {
    labels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    datasets: [{
      data: [
        stats.gradeDistribution?.['A+'] || 0,
        stats.gradeDistribution?.A || 0,
        stats.gradeDistribution?.['B+'] || 0,
        stats.gradeDistribution?.B || 0,
        stats.gradeDistribution?.['C+'] || 0,
        stats.gradeDistribution?.C || 0,
        stats.gradeDistribution?.D || 0,
        stats.gradeDistribution?.F || 0
      ],
      backgroundColor: [
        gradeColors['A+'],
        gradeColors['A'],
        gradeColors['B+'],
        gradeColors['B'],
        gradeColors['C+'],
        gradeColors['C'],
        gradeColors['D'],
        gradeColors['F']
      ],
      borderColor: [
        gradeColors['A+'],
        gradeColors['A'],
        gradeColors['B+'],
        gradeColors['B'],
        gradeColors['C+'],
        gradeColors['C'],
        gradeColors['D'],
        gradeColors['F']
      ],
      borderWidth: 2,
      hoverBorderWidth: 4,
      hoverOffset: 8,
    }]
  };

  /**
   * IMPROVED RESUME COMPLETENESS RADAR CHART
   * Accurately displays all 6 ATS criteria sections
   */
  const completenessData = {
    labels: ['Contact Info', 'Summary', 'Experience', 'Education', 'Skills', 'Certifications'],
    datasets: [{
      label: 'Completeness Score',
      data: result ? [
        (result.completeness?.contact_info ? 100 : 0),
        (result.completeness?.summary ? 100 : 0),
        (result.completeness?.experience ? 100 : 0),
        (result.completeness?.education ? 100 : 0),
        (result.completeness?.skills ? 100 : 0),
        (result.completeness?.certifications ? 100 : 0)
      ] : [0, 0, 0, 0, 0, 0],
      backgroundColor: colorPalette.primaryLight,
      borderColor: colorPalette.primary,
      borderWidth: 3,
      pointBackgroundColor: colorPalette.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 10,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colorPalette.primary,
      pointHoverBorderWidth: 4,
    }]
  };

  /**
   * IMPROVED SKILL CATEGORIES BAR CHART
   * Shows exact skill counts per category
   */
  const skillCategoriesData = {
    labels: ['Programming', 'Web Dev', 'Database', 'Cloud', 'Data Science', 'Soft Skills'],
    datasets: [{
      label: 'Skills Found',
      data: result?.skills_found ? [
        (Array.isArray(result.skills_found.programming) ? result.skills_found.programming.length : 0),
        (Array.isArray(result.skills_found.web) ? result.skills_found.web.length : 0),
        (Array.isArray(result.skills_found.database) ? result.skills_found.database.length : 0),
        (Array.isArray(result.skills_found.cloud) ? result.skills_found.cloud.length : 0),
        (Array.isArray(result.skills_found.data) ? result.skills_found.data.length : 0),
        (Array.isArray(result.skills_found.soft) ? result.skills_found.soft.length : 0)
      ] : [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        skillCategoryColors.programming,
        skillCategoryColors.web,
        skillCategoryColors.database,
        skillCategoryColors.cloud,
        skillCategoryColors.data,
        skillCategoryColors.soft
      ],
      borderColor: [
        skillCategoryColors.programming,
        skillCategoryColors.web,
        skillCategoryColors.database,
        skillCategoryColors.cloud,
        skillCategoryColors.data,
        skillCategoryColors.soft
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBorderWidth: 3,
      hoverBorderColor: '#fff',
    }]
  };

  /**
   * IMPROVED SKILL DISTRIBUTION POLAR CHART
   * Alternative visualization for skill spread
   */
  const polarSkillData = {
    labels: ['Programming', 'Web Dev', 'Database', 'Cloud', 'Data Science', 'Soft Skills'],
    datasets: [{
      data: result?.skills_found ? [
        (Array.isArray(result.skills_found.programming) ? result.skills_found.programming.length : 0),
        (Array.isArray(result.skills_found.web) ? result.skills_found.web.length : 0),
        (Array.isArray(result.skills_found.database) ? result.skills_found.database.length : 0),
        (Array.isArray(result.skills_found.cloud) ? result.skills_found.cloud.length : 0),
        (Array.isArray(result.skills_found.data) ? result.skills_found.data.length : 0),
        (Array.isArray(result.skills_found.soft) ? result.skills_found.soft.length : 0)
      ] : [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        skillCategoryColors.programming,
        skillCategoryColors.web,
        skillCategoryColors.database,
        skillCategoryColors.cloud,
        skillCategoryColors.data,
        skillCategoryColors.soft
      ],
      borderColor: [
        skillCategoryColors.programming,
        skillCategoryColors.web,
        skillCategoryColors.database,
        skillCategoryColors.cloud,
        skillCategoryColors.data,
        skillCategoryColors.soft
      ],
      borderWidth: 2,
      hoverBorderWidth: 4,
      hoverOffset: 12,
    }]
  };

  /**
   * IMPROVED PERFORMANCE METRICS TREND
   * Shows multiple metrics over time
   */
  const metricsData = {
    labels: history.slice(-10).map((_, i) => `Resume ${i + 1}`),
    datasets: [
      {
        label: 'ATS Score',
        data: normalizeData(history.slice(-10).map(h => h.score || 0), 0, 100),
        borderColor: colorPalette.primary,
        backgroundColor: colorPalette.primaryLight,
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: colorPalette.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Skills Count',
        data: history.slice(-10).map(h => h.metrics?.total_skills || 0),
        borderColor: colorPalette.success,
        backgroundColor: colorPalette.successLight,
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: colorPalette.success,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Completeness %',
        data: normalizeData(history.slice(-10).map(h => h.metrics?.completeness_percentage || 0), 0, 100),
        borderColor: colorPalette.info,
        backgroundColor: colorPalette.infoLight,
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: colorPalette.info,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  return (
    <div className="ats-dashboard-container">
      {/* Navigation & Upload Section */}
      <div className="ats-nav">
        <div className="ats-brand">📊 Resume Analyzer</div>
        <button className="ats-btn ats-btn-primary" onClick={upload} disabled={!file || loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {/* File Upload */}
      <div className="ats-card ats-mb-lg">
        <label className="ats-form-label">Upload Resume (PDF)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="ats-form-input"
        />
      </div>

      {error && <div className="ats-card ats-error-card">{error}</div>}

      {/* Stats Grid */}
      {history.length > 0 && (
        <div className="ats-stats-grid ats-mb-lg">
          <div className="ats-stat-card">
            <span className="ats-stat-value">{stats.totalResumes}</span>
            <span className="ats-stat-label">Total Resumes</span>
          </div>
          <div className="ats-stat-card">
            <span className="ats-stat-value">{stats.averageScore}</span>
            <span className="ats-stat-label">Avg Score</span>
          </div>
          <div className="ats-stat-card">
            <span className="ats-stat-value">{stats.averageSkills}</span>
            <span className="ats-stat-label">Avg Skills</span>
          </div>
          <div className="ats-stat-card">
            <span className="ats-stat-value">{stats.averageCompleteness}%</span>
            <span className="ats-stat-label">Avg Completeness</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="ats-charts-grid ats-mb-lg">
        <div className="ats-chart-container">
          <h3 className="ats-chart-title">ATS Score Trend</h3>
          <Line data={chartData} options={lineChartOptions} />
        </div>

        <div className="ats-chart-container">
          <h3 className="ats-chart-title">Grade Distribution</h3>
          <div className="relative h-[300px] flex items-center justify-center">
            <Doughnut data={gradeData} options={doughnutChartOptions} />
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-[#05AF2B] leading-none">
                {Object.entries(stats.gradeDistribution).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Top Grade</span>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="ats-charts-grid ats-mb-lg">
          <div className="ats-chart-container">
            <h3 className="ats-chart-title">Resume Completeness</h3>
            <Radar data={completenessData} options={radarChartOptions} />
          </div>

          <div className="ats-chart-container">
            <h3 className="ats-chart-title">Skill Categories</h3>
            <Bar data={skillCategoriesData} options={barChartOptions} />
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div className="ats-chart-container ats-mb-lg">
          <h3 className="ats-chart-title">Performance Metrics Trend</h3>
          <Line data={metricsData} options={lineChartOptions} />
        </div>
      )}

      {/* Result Details */}
      {result && (
        <div className="ats-card">
          <h2 className="ats-text-gradient ats-mb-lg">Analysis Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4 className="ats-mb-sm">Score</h4>
              <div className="ats-stat-value">{result.score}/100</div>
              <span className="ats-badge" style={{ background: `${gradeColors[result.grade]}20` }}>
                {result.grade}
              </span>
            </div>
            <div>
              <h4 className="ats-mb-sm">Feedback</h4>
              <p className="ats-text-secondary">{result.feedback}</p>
            </div>
            <div>
              <h4 className="ats-mb-sm">Suggestions</h4>
              <ul className="ats-list">
                {result.suggestions?.map((s, i) => (
                  <li key={i} className="ats-item">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
