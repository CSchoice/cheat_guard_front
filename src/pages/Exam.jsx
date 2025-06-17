// src/pages/Exam.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Button, VStack, Text, Spinner, useToast, Select,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { startExam } from '../services/examService';
import streamingService from '../services/streamingService';
import CameraService from '../services/cameraService';

const cameraService = new CameraService();

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [videoEl, setVideoEl] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [cameraLoading, setCameraLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // video ref
  const videoRef = useCallback(node => {
    if (node) setVideoEl(node);
  }, []);

  // 1) 권한 요청 + 장치 목록 조회
  useEffect(() => {
    let tempStream = null;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        tempStream = stream;
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(list => {
        const cams = list.filter(d => d.kind === 'videoinput');
        setDevices(cams);
        if (cams.length) setSelectedDevice(cams[0].deviceId);
      })
      .catch(err => {
        console.error('카메라 권한 요청 실패:', err);
        setError('카메라 권한을 허용해야 진행할 수 있습니다.');
      })
      .finally(() => {
        if (tempStream) {
          tempStream.getTracks().forEach(t => t.stop());
        }
        setCameraLoading(false);
      });
  }, []);

  // 2) 선택된 장치로 카메라 시작
  useEffect(() => {
    if (!videoEl || !selectedDevice) return;

    setCameraLoading(true);
    cameraService.startCamera(videoEl, selectedDevice)
      .catch(err => {
        console.error(err);
        setError('카메라를 초기화할 수 없습니다.');
      })
      .finally(() => {
        setCameraLoading(false);
      });

    return () => {
      cameraService.stopCamera();
    };
  }, [videoEl, selectedDevice]);

  // 프레임 전송 재귀 함수
  const captureLoop = useRef();
  captureLoop.current = () => {
    if (!examStarted) return;
    cameraService.captureFrame()
      .then(frame => frame && streamingService.sendFrame(frame))
      .catch(console.error)
      .finally(() => {
        setTimeout(captureLoop.current, 1000);
      });
  };

  // examStarted 변경 감지하여 루프 시작
  useEffect(() => {
    if (examStarted) {
      console.log('[Exam] captureLoop 시작');
      captureLoop.current();
    }
  }, [examStarted]);

  // 시험 시작
  const startExamSession = async () => {
    setExamLoading(true);
    try {
      // 1. 시험 시작 API 호출
      const { sessionId } = await startExam(examId);
      console.log('시험 세션 시작됨 - sessionId:', sessionId);

      // 2. WebSocket 연결 초기화
      streamingService.initialize(sessionId);

      // 3. WebSocket 이벤트 리스너 설정
      streamingService.onAnalysis((data) => {
        console.log('분석 결과 수신:', data);
        setAnalysisResult(prev => ({
          ...prev,
          ...data,
          timestamp: new Date().toISOString()
        }));

        if (data.cheatingDetected) {
          toast({
            title: '부정행위 감지',
            description: '부정행위가 감지되어 시험을 종료합니다.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          stopExam();
        }
      });

      // 4. examStarted 플래그만 올리기 (루프는 useEffect에서 시작)
      setExamStarted(true);

      // 5. 성공 알림
      toast({
        title: '시험 시작',
        description: '시험이 시작되었습니다. 카메라가 정상적으로 작동하는지 확인해주세요.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      console.error('시험 시작 중 오류:', err);
      toast({
        title: '시험 시작 실패',
        description: err.response?.data?.message || '시험을 시작하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExamLoading(false);
    }
  };

  // 시험 종료
  const stopExam = () => {
    setExamStarted(false);
    cameraService.stopCamera();
    streamingService.disconnect();
    toast({ title: '시험 종료', status: 'info', duration: 3000, isClosable: true });
    navigate('/dashboard');
  };

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      setExamStarted(false);
      cameraService.stopCamera();
      streamingService.disconnect();
    };
  }, []);

  // 에러 화면
  if (error) {
    return (
      <Box textAlign="center" mt={10} p={4}>
        <Text color="red.500" mb={4}>{error}</Text>
        <Button onClick={() => window.location.reload()}>새로고침</Button>
      </Box>
    );
  }

  return (
    <VStack spacing={6} p={4} maxW="800px" mx="auto">
      {/* 카메라 선택 UI */}
      <Select
        value={selectedDevice}
        onChange={e => setSelectedDevice(e.target.value)}
        mb={4}
        isDisabled={cameraLoading}
      >
        {devices.map(d => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Camera ${d.deviceId}`}
          </option>
        ))}
      </Select>

      {/* 비디오 */}
      <Box position="relative" width="100%" pb="56.25%" bg="black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />
        {cameraLoading && (
          <Box
            position="absolute" inset={0}
            display="flex" alignItems="center" justifyContent="center"
            bg="rgba(0,0,0,0.5)"
          >
            <Spinner size="lg" color="white" mr={2} />
            <Text color="white">카메라 초기화 중...</Text>
          </Box>
        )}
      </Box>

      {/* 버튼 */}
      {!examStarted ? (
        <Button
          colorScheme="blue"
          isLoading={examLoading}
          isDisabled={cameraLoading}
          onClick={startExamSession}
        >
          시험 시작
        </Button>
      ) : (
        <Button colorScheme="red" onClick={stopExam}>
          시험 종료
        </Button>
      )}

      {/* 분석 결과 */}
      {analysisResult && (
        <Box width="100%" p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <Text fontWeight="bold">실시간 분석 결과:</Text>
          <Text as="pre" whiteSpace="pre-wrap">
            {JSON.stringify(analysisResult, null, 2)}
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default Exam;
