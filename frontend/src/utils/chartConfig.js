/**
 * CHART.JS CONFIGURATION & OPTIMIZATION GUIDE
 * Enhanced for accurate ATS data visualization
 * Job Portal Integration - Green Theme Colors
 */

// Default Chart.js options for consistent styling
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#b8b8b8',
        font: {
          size: 13,
          weight: 600,
          family: 'system-ui, -apple-system, sans-serif'
        },
        padding: 16,
        boxWidth: 12,
        usePointStyle: false,
        borderRadius: 2
      }
    },
    tooltip: {
      backgroundColor: 'rgba(13, 13, 13, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#b8b8b8',
      borderColor: 'rgba(5, 175, 43, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        labelColor: (context) => ({
          borderColor: context.dataset.borderColor,
          backgroundColor: context.dataset.backgroundColor
        })
      },
      font: {
        size: 12,
        weight: 500,
        family: 'system-ui, -apple-system, sans-serif'
      },
      cornerRadius: 8,
      titleMarginBottom: 8,
      bodySpacing: 8
    },
    filler: {
      propagate: true
    }
  }
};

/**
 * LINE CHART - ATS Score Trend
 * Displays resume scores over time
 */
export const lineChartOptions = {
  ...defaultChartOptions,
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
        drawBorder: false,
        drawTicks: false
      },
      ticks: {
        color: '#898989',
        font: {
          size: 11,
          weight: 500
        },
        padding: 8,
        stepSize: 20
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#898989',
        font: {
          size: 11,
          weight: 500
        },
        padding: 8
      }
    }
  }
};

/**
 * BAR CHART - Skill Categories
 * Shows skill distribution across categories
 */
export const barChartOptions = {
  ...defaultChartOptions,
  indexAxis: 'y',
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
        drawBorder: false
      },
      ticks: {
        color: '#898989',
        font: {
          size: 11,
          weight: 500
        },
        padding: 8,
        stepSize: 2
      }
    },
    y: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#898989',
        font: {
          size: 12,
          weight: 500
        },
        padding: 12
      }
    }
  }
};

/**
 * DOUGHNUT CHART - Grade Distribution
 * Shows breakdown of resume grades
 */
export const doughnutChartOptions = {
  ...defaultChartOptions,
  cutout: '75%',
  spacing: 5,
  borderRadius: 10,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      position: 'bottom',
      labels: {
        ...defaultChartOptions.plugins.legend.labels,
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      ...defaultChartOptions.plugins.tooltip,
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return ` ${label}: ${value} Resumes (${percentage}%)`;
        }
      }
    }
  }
};

/**
 * RADAR CHART - Resume Completeness
 * Displays all ATS criteria fulfillment
 */
export const radarChartOptions = {
  ...defaultChartOptions,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        color: '#898989',
        font: {
          size: 11,
          weight: 500
        },
        stepSize: 20,
        showLabelBackdrop: false
      },
      grid: {
        color: 'rgba(5, 175, 43, 0.1)',
        circular: true
      },
      angleLines: {
        color: 'rgba(255, 255, 255, 0.04)'
      }
    }
  }
};

/**
 * POLAR AREA CHART - Skill Distribution
 * Alternative view for skill categories
 */
export const polarChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      position: 'right'
    }
  },
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        color: '#898989',
        font: {
          size: 11,
          weight: 500
        },
        stepSize: 20,
        showLabelBackdrop: false
      },
      grid: {
        color: 'rgba(5, 175, 43, 0.1)'
      },
      angleLines: {
        color: 'rgba(255, 255, 255, 0.04)'
      }
    }
  }
};

/**
 * PIE CHART - Summary Statistics
 * Shows key metric breakdown
 */
export const pieChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      position: 'bottom'
    }
  }
};

/**
 * COLOR PALETTES
 * Consistent color scheme for all charts
 */
export const colorPalette = {
  primary: '#05AF2B',
  primaryLight: 'rgba(5, 175, 43, 0.2)',
  secondary: '#10B981',
  secondaryLight: 'rgba(16, 185, 129, 0.2)',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.2)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.2)',
  error: '#F87171',
  errorLight: 'rgba(248, 113, 113, 0.2)',
  info: '#60A5FA',
  infoLight: 'rgba(96, 165, 250, 0.2)',
  tertiary: '#22D3EE',
  tertiaryLight: 'rgba(34, 211, 238, 0.2)',
  purple: '#A78BFA',
  purpleLight: 'rgba(167, 139, 250, 0.2)'
};

/**
 * GRADE COLORS
 * Color coding for ATS grades - Distinct for each grade
 */
export const gradeColors = {
  'A+': '#05AF2B',
  'A': '#34D399',
  'B+': '#60A5FA',
  'B': '#818CF8',
  'C+': '#FBBF24',
  'C': '#FB923C',
  'D': '#F87171',
  'F': '#94A3B8'
};

/**
 * SKILL CATEGORY COLORS
 * Distinct colors for each skill category
 */
export const skillCategoryColors = {
  programming: '#05AF2B',
  web: '#60A5FA',
  database: '#A78BFA',
  cloud: '#22D3EE',
  data: '#FBBF24',
  soft: '#F87171'
};

/**
 * Calculate accurate percentage
 */
export const calculatePercentage = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Format large numbers with abbreviation
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Get grade color based on score
 */
export const getGradeColor = (grade) => {
  return gradeColors[grade] || gradeColors['D'];
};

/**
 * Get skill category color
 */
export const getSkillCategoryColor = (category) => {
  return skillCategoryColors[category] || skillCategoryColors['programming'];
};

/**
 * Validate chart data integrity
 */
export const validateChartData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(item => typeof item === 'number' && !isNaN(item));
};

/**
 * Ensure data is within valid range
 */
export const normalizeData = (data, min = 0, max = 100) => {
  return data.map(item => Math.max(min, Math.min(max, item)));
};

/**
 * Calculate trend indicator
 */
export const calculateTrend = (currentValue, previousValue) => {
  if (previousValue === 0) return 0;
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return parseFloat(change.toFixed(1));
};

/**
 * Format chart labels for readability
 */
export const formatLabel = (label, maxLength = 20) => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + '...';
};

export default {
  defaultChartOptions,
  lineChartOptions,
  barChartOptions,
  doughnutChartOptions,
  radarChartOptions,
  polarChartOptions,
  pieChartOptions,
  colorPalette,
  gradeColors,
  skillCategoryColors,
  calculatePercentage,
  formatNumber,
  getGradeColor,
  getSkillCategoryColor,
  validateChartData,
  normalizeData,
  calculateTrend,
  formatLabel
};
