import api from './config';

export const examsApi = {
  // 시험 생성
  createExam: async (examData) => {
    const response = await api.post('/exams', examData);
    return response.data;
  },

  // 시험 목록 조회
  getExams: async () => {
    const response = await api.get('/exams');
    return response.data;
  },

  // 단일 시험 조회
  getExamById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // 시험 참가자 등록
  registerForExam: async (examId, userId) => {
    const response = await api.post(`/exams/${examId}/register`, { userId });
    return response.data;
  },

  // 시험 참가자 목록 조회
  getExamParticipants: async (examId) => {
    const response = await api.get(`/exams/${examId}/participants`);
    return response.data;
  },

  // 시험 시작
  startExam: async (examId) => {
    const response = await api.post(`/exams/${examId}/start`);
    return response.data;
  },

  // 내가 참여 중인 시험 목록을 가져옴
  getMyParticipatingExams: async () => {
    const response = await api.get('/exams/my');
    return response.data;
  },
  
  // 시험 참여하기
  participateInExam: async (examId) => {
    const response = await api.post(`/exams/${examId}/register`);
    return response.data;
  },

  // 시험 참여 취소하기
  cancelParticipateInExam: async (examId) => {
    const response = await api.put(`/exams/${examId}/register`);
    return response.data;
  },

  // 시험 종료
  stopExam: async (examId) => {
    const response = await api.put(`/exams/${examId}/stop`);
    return response.data;
  }
};
