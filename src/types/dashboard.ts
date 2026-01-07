export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category: string;
  createdAt: string;
}

export interface ClassSchedule {
  id: string;
  name: string;
  instructor: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

export interface Quote {
  content: string;
  author: string;
}
