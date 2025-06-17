import api from './config';

export const startExam = async (examId, fastApiUrl) => {
  try {
    const response = await api.post(`/exams/${examId}/start`, { fastApiUrl });
    return response.data;
  } catch (error) {
    console.error('시험 시작 오류:', error);
    throw error;
  }
};

export const getExamStatus = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/status`);
    return response.data;
  } catch (error) {
    console.error('시험 상태 조회 오류:', error);
    throw error;
  }
};
