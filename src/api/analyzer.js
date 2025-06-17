import api from './config';

export const analyzerApi = {
  // 프레임 분석
  analyzeFrame: async (frameFile) => {
    const formData = new FormData();
    formData.append('frame', frameFile);
    
    const response = await api.post('/analyzer/frame', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // 스트리밍 시작
  startStreaming: async (examId, streamName) => {
    const response = await api.post('/streaming/start', { examId, streamName });
    return response.data;
  },

  // 스트리밍 중지
  stopStreaming: async (streamId) => {
    const response = await api.post(`/streaming/stop/${streamId}`, {});
    return response.data;
  }
};
