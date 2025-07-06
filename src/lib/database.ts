// Local storage based database for job application tracking

export interface ApplicationData {
  date: string;
  count: number;
}

export interface StoredData {
  applications: ApplicationData[];
  streak: number;
  todayCount: number;
  lastResetDate: string;
}

export const getStoredData = (): StoredData => {
  try {
    const data = localStorage.getItem('jobTrackerData');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return {
    applications: [],
    streak: 0,
    todayCount: 0,
    lastResetDate: ''
  };
};

export const saveStoredData = (data: StoredData): void => {
  try {
    localStorage.setItem('jobTrackerData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const saveApplicationData = (count: number, date?: string): void => {
  const targetDate = date || new Date().toDateString();
  const storedData = getStoredData();
  
  // Remove existing entry for this date if it exists
  const filteredApplications = storedData.applications.filter(
    app => app.date !== targetDate
  );
  
  // Add new entry only if count > 0
  if (count > 0) {
    filteredApplications.push({
      date: targetDate,
      count: count
    });
  }
  
  // Sort by date (most recent first)
  filteredApplications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Keep only last 365 days of data
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const recentApplications = filteredApplications.filter(
    app => new Date(app.date) >= oneYearAgo
  );
  
  const updatedData = {
    ...storedData,
    applications: recentApplications
  };
  
  saveStoredData(updatedData);
};

// Clear specific date's data (useful for fixing incorrect data)
export const clearDateData = (dateString: string): void => {
  const storedData = getStoredData();
  const filteredApplications = storedData.applications.filter(
    app => app.date !== dateString
  );
  
  const updatedData = {
    ...storedData,
    applications: filteredApplications
  };
  
  saveStoredData(updatedData);
  console.log(`Cleared data for ${dateString}`);
};

export const getTodaysCount = (): number => {
  try {
    const count = localStorage.getItem('todayCount');
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error reading today count:', error);
    return 0;
  }
};

export const updateTodaysCount = (count: number): void => {
  try {
    localStorage.setItem('todayCount', count.toString());
  } catch (error) {
    console.error('Error updating today count:', error);
  }
};

export const getWeeklyTotal = (): number => {
  const storedData = getStoredData();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return storedData.applications
    .filter(app => new Date(app.date) >= oneWeekAgo)
    .reduce((total, app) => total + app.count, 0);
};

export const getMonthlyTotal = (): number => {
  const storedData = getStoredData();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return storedData.applications
    .filter(app => new Date(app.date) >= oneMonthAgo)
    .reduce((total, app) => total + app.count, 0);
};

export const getYearlyTotal = (): number => {
  const storedData = getStoredData();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return storedData.applications
    .filter(app => new Date(app.date) >= oneYearAgo)
    .reduce((total, app) => total + app.count, 0);
};

// Clear all data (useful for testing or reset)
export const clearAllData = (): void => {
  try {
    localStorage.removeItem('jobTrackerData');
    localStorage.removeItem('todayCount');
    localStorage.removeItem('streak');
    localStorage.removeItem('lastResetDate');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
