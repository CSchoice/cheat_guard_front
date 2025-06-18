import React, { useCallback } from 'react';
import { Box, Container, useColorModeValue, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ExamForm from '../components/ExamForm';
import { examsApi } from '../api/exams';

const CreateExam = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = useCallback(async (formData) => {
    try {
      console.log('시험 생성 요청:', formData);
      
      // API를 통해 시험 생성 요청
      const response = await examsApi.createExam(formData);
      console.log('시험 생성 성공:', response);
      
      // 성공 알림 표시
      toast({
        title: '시험이 성공적으로 생성되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 성공 시 시험 목록으로 이동
      navigate('/exams');
    } catch (error) {
      console.error('시험 생성 오류:', error);
      
      // 에러 메시지 추출
      const errorMessage = error.response?.data?.message || '시험 생성 중 오류가 발생했습니다.';
      
      // 에러 알림 표시
      toast({
        title: '오류 발생',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [navigate, toast]);

  return (
    <Box minH="calc(100vh - 64px)" bg={bg} py={8}>
      <Container maxW="container.lg">
        <ExamForm onSubmit={handleSubmit} />
      </Container>
    </Box>
  );
};

export default React.memo(CreateExam);
