import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  FormErrorMessage,
  Text,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const ExamForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    startAt: '',
    endAt: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '시험 제목을 입력해주세요.';
    }
    
    if (!formData.startAt) {
      newErrors.startAt = '시작 일시를 선택해주세요.';
    }
    
    if (!formData.endAt) {
      newErrors.endAt = '종료 일시를 선택해주세요.';
    } else if (new Date(formData.endAt) <= new Date(formData.startAt)) {
      newErrors.endAt = '종료 일시는 시작 일시 이후로 설정해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    // 폼 제출 시 페이지 리로드 방지
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const examData = {
        title: formData.title,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString()
      };
      
      // 상위 컴포넌트로 폼 데이터 전달
      if (onSubmit) {
        await onSubmit(examData);
      } else {
        // 상위 컴포넌트에서 onSubmit을 제공하지 않은 경우 기본 동작
        await api.post('exams', examData);
        toast({
          title: '시험이 생성되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/exams');
      }
    } catch (error) {
      console.error('시험 생성 오류:', error);
      toast({
        title: '시험 생성 실패',
        description: error.response?.data?.message || '시험 생성 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error; // 상위 컴포넌트에서 에러를 처리할 수 있도록 에러를 다시 던집니다.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" bg={bg} borderColor={borderColor}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="lg" mb={2} textAlign="center">
            새로운 시험 생성
          </Heading>
          <Text color="gray.500" textAlign="center">
            시험 정보를 입력해주세요
          </Text>
        </Box>
        
        <FormControl isRequired isInvalid={!!errors.title}>
          <FormLabel>시험 제목</FormLabel>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: JavaScript 중간고사"
          />
          <FormErrorMessage>{errors.title}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!errors.startAt}>
          <FormLabel>시작 일시</FormLabel>
          <Input
            type="datetime-local"
            name="startAt"
            value={formData.startAt}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.startAt}</FormErrorMessage>
        </FormControl>
        
        <FormControl isRequired isInvalid={!!errors.endAt}>
          <FormLabel>종료 일시</FormLabel>
          <Input
            type="datetime-local"
            name="endAt"
            value={formData.endAt}
            onChange={handleChange}
            min={formData.startAt}
          />
          <FormErrorMessage>{errors.endAt}</FormErrorMessage>
        </FormControl>
        
        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={isLoading}
          loadingText="생성 중..."
        >
          시험 생성하기
        </Button>
      </VStack>
    </Box>
  );
};

export default ExamForm;
