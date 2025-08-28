// JLPT Level Configuration
export const JLPT_LEVELS = {
  N5: {
    level: 'N5',
    name: 'N5',
    color: '#4A90E2',           // Blue
    bgColor: '#E8F4FD',         // Light blue
    darkColor: '#357ABD',       // Darker blue
    lightColor: '#6BA3E8'       // Lighter blue
  },
  N4: {
    level: 'N4', 
    name: 'N4',
    color: '#7ED321',           // Green
    bgColor: '#F0FCE8',         // Light green
    darkColor: '#5BB31A',       // Darker green
    lightColor: '#96D847'       // Lighter green
  },
  N3: {
    level: 'N3',
    name: 'N3', 
    color: '#F5A623',           // Orange
    bgColor: '#FFF8E8',         // Light orange
    darkColor: '#D4861B',       // Darker orange
    lightColor: '#F7B849'       // Lighter orange
  },
  N2: {
    level: 'N2',
    name: 'N2',
    color: '#BD10E0',           // Purple
    bgColor: '#F8E8FF',         // Light purple
    darkColor: '#9A0DB8',       // Darker purple
    lightColor: '#D336E6'       // Lighter purple
  },
  N1: {
    level: 'N1',
    name: 'N1',
    color: '#E74C3C',           // Red
    bgColor: '#FDEAEA',         // Light red
    darkColor: '#C0392B',       // Darker red
    lightColor: '#EC7063'       // Lighter red
  }
};

export const JLPT_LEVEL_ARRAY = Object.values(JLPT_LEVELS);

export const getLevelConfig = (level) => {
  return JLPT_LEVELS[level] || JLPT_LEVELS.N5;
};

export const getLevelColor = (level) => {
  return getLevelConfig(level).color;
};

export const getLevelBgColor = (level) => {
  return getLevelConfig(level).bgColor;
};