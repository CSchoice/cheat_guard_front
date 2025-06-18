import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  FiFileText,
  FiPlay,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { examsApi } from '../api/exams';
import StatsCard from '../components/dashboard/StatsCard';
import ExamList from '../components/dashboard/ExamList';

const ITEMS_PER_PAGE = 5;

const defaultStats = {
  totalExams: 0,
  activeExams: 0,
  completedExams: 0,
};

const Dashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [allExams, setAllExams] = useState([]);
  const [participatingExams, setParticipatingExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const handleParticipate = async (examId) => {
    try {
      setIsLoading(true);
      const response = await examsApi.participateInExam(examId);

      if (response) {
        setAllExams(prevExams =>
          prevExams.map(exam =>
            exam.id === examId ? { ...exam, isParticipating: true } : exam
          )
        );

        const examToAdd = allExams.find(exam => exam.id === examId);
        if (examToAdd) {
          setParticipatingExams(prev => [
            { ...examToAdd, isParticipating: true },
            ...prev.filter(e => e.id !== examId)
          ].slice(0, ITEMS_PER_PAGE));
        }

        toast({
          title: '시험에 참여했습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        await fetchDashboardData();
      }
    } catch (error) {
      console.error('시험 참여 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: error.message || '시험 참여에 실패했습니다. 다시 시도해주세요.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

    // 참가 취소 핸들러 추가
  const handleCancelParticipate = async (examId) => {
    try {
      setIsLoading(true);
      const response = await examsApi.cancelParticipateInExam(examId); // toggle API

      if (response) {
        setAllExams(prevExams =>
          prevExams.map(exam =>
            exam.id === examId ? { ...exam, isParticipating: false } : exam
          )
        );

        setParticipatingExams(prev =>
          prev.filter(exam => exam.id !== examId)
        );

        toast({
          title: '참여가 취소되었습니다.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });

        await fetchDashboardData();
      }
    } catch (error) {
      console.error('참가 취소 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: error.message || '참가 취소에 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [allExamsResponse, myExamsResponse] = await Promise.all([
        examsApi.getExams(),
        examsApi.getMyParticipatingExams()
      ]);

      const allExamsData = Array.isArray(allExamsResponse) ? allExamsResponse : (allExamsResponse?.data || []);
      const myExamsData = Array.isArray(myExamsResponse) ? myExamsResponse : (myExamsResponse?.data || []);

      const myExamIds = new Set(myExamsData.map(exam => exam.id));

      const allExamsWithParticipation = allExamsData
        .map(exam => ({
          ...exam,
          isParticipating: myExamIds.has(exam.id)
        }))
        .slice(0, ITEMS_PER_PAGE);

      const participatingExamsData = myExamsData
        .slice(0, ITEMS_PER_PAGE)
        .map(exam => ({
          ...exam,
          isParticipating: true
        }));

      setAllExams(allExamsWithParticipation);
      setParticipatingExams(participatingExamsData);

      const now = new Date();
      const stats = {
        totalExams: allExamsData.length,
        activeExams: allExamsData.filter(exam => new Date(exam.deadlineAt) > now).length,
        completedExams: allExamsData.filter(exam => new Date(exam.deadlineAt) <= now).length,
      };

      setStats(stats);
      setError(null);
    } catch (err) {
      console.error('대시보드 데이터를 불러오는 중 오류 발생:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} color="red.500">
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>
        대시보드
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={8}>
        <StatsCard
          title="전체 시험"
          value={stats.totalExams}
          icon={FiFileText}
          colorScheme="blue"
        />
        <StatsCard
          title="진행 중인 시험"
          value={stats.activeExams}
          icon={FiPlay}
          colorScheme="green"
        />
        <StatsCard
          title="종료된 시험"
          value={stats.completedExams}
          icon={FiCheckCircle}
          colorScheme="gray"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box>
          <Heading size="md" mb={4}>
            시험 목록
            {allExams.length > 0 && (
              <Button
                as={RouterLink}
                to="/exams"
                size="sm"
                variant="outline"
                ml={2}
                rightIcon={<FiArrowRight />}
              >
                전체보기
              </Button>
            )}
          </Heading>
          <Box borderWidth="1px" borderRadius="lg" p={4} minH="200px">
            <ExamList
              exams={allExams}
              onParticipate={handleParticipate}
              onCancelParticipate={handleCancelParticipate}
              isLoading={false}
              emptyMessage="등록된 시험이 없습니다."
            />
          </Box>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            참여 중인 시험
            {participatingExams.length > 0 && (
              <Button
                as={RouterLink}
                to="/my-exams"
                size="sm"
                variant="outline"
                ml={2}
                rightIcon={<FiArrowRight />}
              >
                전체보기
              </Button>
            )}
          </Heading>
          <Box borderWidth="1px" borderRadius="lg" p={4} minH="200px">
            <ExamList
              exams={participatingExams}
              onParticipate={handleParticipate}
              isLoading={false}
              onCancelParticipate={handleCancelParticipate}
              emptyMessage="참여 중인 시험이 없습니다."
            />
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
