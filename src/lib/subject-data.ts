
export const subjectData: Record<string, Record<number, string[]>> = {
  'btech-cs': {
    1: ['Mathematics I', 'Physics', 'Mechanics', 'Introduction to Programming'],
    2: ['Mathematics II', 'Chemistry', 'Thermodynamics', 'Data Structures'],
    3: ['Discrete Mathematics', 'Digital Logic', 'Computer Organization', 'Object Oriented Programming'],
    4: ['Algorithms', 'Operating Systems', 'Database Management', 'Theory of Computation'],
    5: ['Computer Networks', 'Software Engineering', 'Microprocessors', 'Machine Learning'],
    6: ['Artificial Intelligence', 'Compiler Design', 'Cloud Computing', 'Cryptography'],
    7: ['Internet of Things', 'Mobile Computing', 'Big Data Analytics', 'Ethics in Engineering'],
    8: ['Capstone Project', 'Cyber Security', 'Elective Subject', 'Professional Ethics']
  },
  'bsc-math': {
    1: ['Calculus', 'Algebra', 'Trigonometry'],
    2: ['Real Analysis', 'Differential Equations', 'Analytical Geometry'],
    3: ['Linear Algebra', 'Numerical Methods', 'Abstract Algebra'],
    4: ['Complex Analysis', 'Probability Theory', 'Vector Calculus']
  },
  'mba': {
    1: ['Managerial Economics', 'Financial Accounting', 'Marketing Management', 'Organizational Behavior'],
    2: ['Human Resource Management', 'Operations Management', 'Business Analytics', 'Corporate Finance'],
    3: ['Strategic Management', 'Supply Chain Management', 'Entrepreneurship', 'Consumer Behavior'],
    4: ['Business Law', 'Project Management', 'Sustainability', 'Global Business']
  },
  'other': {
    1: ['General Science', 'General Humanities', 'Communication Skills'],
    2: ['Environmental Studies', 'Basics of Computing', 'Value Education']
  }
};

export function getSubjects(course: string, semester: number): string[] {
  const courseData = subjectData[course] || subjectData['other'];
  return courseData[semester] || courseData[1] || [];
}
