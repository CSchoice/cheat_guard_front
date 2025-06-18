import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Button,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../api/exams';
import { useAuth } from '../contexts/AuthContext';
import ExamItem from '../components/dashboard/ExamItem';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartExam = async (examId) => {
    try {
      const response = await examsApi.startExam(examId);
      navigate(`/exam/${examId}`, {
        state: {
          sessionId: response.sessionId,
          fastApiUrl: response.fastApiUrl
        }
      });
    } catch (error) {
      console.error('시험 시작 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: error.response?.data?.message || '시험을 시작하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateParticipationStatus = async () => {
    const myExamsResponse = await examsApi.getMyParticipatingExams();
    const myExams = Array.isArray(myExamsResponse) ? myExamsResponse : (myExamsResponse?.data || []);

    setExams(prevExams =>
      prevExams.map(exam => ({
        ...exam,
        isParticipating: myExams.some(myExam => myExam.id === exam.id)
      }))
    );
  };

  const handleParticipate = async (examId) => {
    try {
      await examsApi.participateInExam(examId);
      toast({
        title: '참여 완료',
        description: '시험에 성공적으로 참여했습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await updateParticipationStatus();
    } catch (error) {
      console.error('시험 참여 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: error.response?.data?.message || '시험에 참여하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelParticipate = async (examId) => {
    try {
      await examsApi.cancelParticipateInExam(examId); // 같은 API
      toast({
        title: '참여가 취소되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      await updateParticipationStatus();
    } catch (error) {
      console.error('참가 취소 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: error.response?.data?.message || '참가 취소 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAllExams = async () => {
      try {
        setIsLoading(true);
        const [allExamsResponse, myExamsResponse] = await Promise.all([
          examsApi.getExams(),
          examsApi.getMyParticipatingExams()
        ]);

        const allExams = Array.isArray(allExamsResponse) ? allExamsResponse : (allExamsResponse?.data || []);
        const myExams = Array.isArray(myExamsResponse) ? myExamsResponse : (myExamsResponse?.data || []);

        if (!isMounted) return;

        const now = new Date();
        const processedExams = myExams.map(exam => ({
          ...exam,
          status: new Date(exam.deadlineAt) > now ? 'available' : 'ended',
          isParticipating: myExams.some(myExam => myExam.id === exam.id)
        }));

        setExams(processedExams);
      } catch (error) {
        console.error('시험 목록을 불러오는 중 오류 발생:', error);
        if (isMounted) {
          toast({
            title: '오류 발생',
            description: error.response?.data?.message || '시험 목록을 불러오는 중 오류가 발생했습니다.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllExams();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableExams = filteredExams.filter(exam => exam.status === 'available');
  const endedExams = filteredExams.filter(exam => exam.status === 'ended');

  if (isLoading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">전체 시험 목록</Heading>
      </Flex>

      <Card mb={6}>
        <CardBody>
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="시험 제목 또는 설명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {availableExams.length > 0 && (
        <>
          <Heading size="md" mb={4}>진행 중인 시험</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
            {availableExams.map(exam => (
              <ExamItem
                key={exam.id}
                exam={exam}
                onParticipate={handleParticipate}
                onCancelParticipate={handleCancelParticipate}
                onStart={handleStartExam}
              />
            ))}
          </SimpleGrid>
        </>
      )}

      {endedExams.length > 0 && (
        <>
          <Heading size="md" mb={4}>종료된 시험</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {endedExams.map(exam => (
              <ExamItem
                key={exam.id}
                exam={exam}
                disabled
              />
            ))}
          </SimpleGrid>
        </>
      )}

      {filteredExams.length === 0 && (
        <Center h="200px">
          <Text>검색 결과가 없습니다.</Text>
        </Center>
      )}
    </Box>
  );
};

export default Exams;