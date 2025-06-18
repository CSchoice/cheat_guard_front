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
  FiClock,
  FiCheckCircle,
  FiBarChart2,
  FiArrowRight
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { examsApi } from '../api/exams';
import StatsCard from '../components/dashboard/StatsCard';
import ExamList from '../components/dashboard/ExamList';

// 페이지당 표시할 항목 수
const ITEMS_PER_PAGE = 5;

// 샘플 데이터 (API 호출 실패 시 사용)
const defaultStats = {
  totalExams: 0,
  activeExams: 0,
  upcomingExams: 0,
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
  
  // 시험 참여 처리
  const handleParticipate = async (examId) => {
    try {
      setIsLoading(true);
      const response = await examsApi.participateInExam(examId);
      
      // API 응답이 성공적일 때 상태 업데이트
      if (response) {
        // 전체 시험 목록에서 참여 상태 업데이트
        setAllExams(prevExams => 
          prevExams.map(exam => 
            exam.id === examId ? { ...exam, isParticipating: true } : exam
          )
        );
        
        // 참여한 시험 목록에 추가
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
        
        // 참여 후 대시보드 데이터 새로고침
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

  // 대시보드 데이터 가져오기
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 병렬로 시험 목록과 참여 중인 시험 목록 가져오기
      console.log('Fetching exam data...');
      const [allExamsResponse, myExamsResponse] = await Promise.all([
        examsApi.getExams(),
        examsApi.getMyParticipatingExams()
      ]);
      
      console.log('API 응답:', { allExamsResponse, myExamsResponse });
      
      // API 응답에서 data 속성이 있는지 확인하고, 없으면 응답 자체를 사용
      const allExamsData = Array.isArray(allExamsResponse) ? allExamsResponse : (allExamsResponse?.data || []);
      const myExamsData = Array.isArray(myExamsResponse) ? myExamsResponse : (myExamsResponse?.data || []);
      
      console.log('파싱된 데이터:', { allExamsData, myExamsData });
      
      // 참여 중인 시험 ID 집합 생성
      const myExamIds = new Set(myExamsData.map(exam => exam.id));
      
      // 전체 시험 목록에 참여 여부 추가 (최대 ITEMS_PER_PAGE개)
      const allExamsWithParticipation = allExamsData
        .map(exam => ({
          ...exam,
          isParticipating: myExamIds.has(exam.id)
        }))
        .slice(0, ITEMS_PER_PAGE);
      
      // 참여 중인 시험 목록 (최대 ITEMS_PER_PAGE개)
      const participatingExamsData = myExamsData
        .slice(0, ITEMS_PER_PAGE)
        .map(exam => ({
          ...exam,
          isParticipating: true
        }));
      
      console.log('설정할 데이터:', { allExamsWithParticipation, participatingExamsData });
      setAllExams(allExamsWithParticipation);
      setParticipatingExams(participatingExamsData);
      
      // 통계 계산
      const now = new Date();
      const stats = {
        totalExams: allExamsData.length,
        activeExams: allExamsData.filter(exam => {
          const start = new Date(exam.startedAt);
          const end = new Date(exam.endedAt);
          return now >= start && now <= end;
        }).length,
        upcomingExams: allExamsData.filter(exam => new Date(exam.startedAt) > now).length,
        completedExams: allExamsData.filter(exam => new Date(exam.endedAt) < now).length,
      };
      
      console.log('설정할 통계:', stats);
      setStats(stats);
      setError(null);
      console.log('대시보드 데이터 로드 완료');
    } catch (err) {
      console.error('대시보드 데이터를 불러오는 중 오류 발생:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 컴포넌트 마운트 시 데이터 불러오기
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
      
      {/* 통계 카드 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
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
          title="예정된 시험" 
          value={stats.upcomingExams}
          icon={FiClock}
          colorScheme="blue"
        />
        <StatsCard 
          title="종료된 시험" 
          value={stats.completedExams}
          icon={FiCheckCircle}
          colorScheme="gray"
        />
      </SimpleGrid>
      
      {/* 시험 목록 그리드 */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* 전체 시험 목록 */}
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
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" h="100%">
                <Spinner />
              </Box>
            ) : allExams.length > 0 ? (
              <ExamList 
                exams={allExams} 
                onParticipate={handleParticipate} 
                isLoading={false}
                emptyMessage="등록된 시험이 없습니다."
              />
            ) : (
              <Box textAlign="center" py={10} color="gray.500">
                등록된 시험이 없습니다.
              </Box>
            )}
          </Box>
        </Box>
        
        {/* 참여 중인 시험 목록 */}
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
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" h="100%">
                <Spinner />
              </Box>
            ) : participatingExams.length > 0 ? (
              <ExamList 
                exams={participatingExams} 
                onParticipate={handleParticipate} 
                isLoading={false}
                emptyMessage="참여 중인 시험이 없습니다."
              />
            ) : (
              <Box textAlign="center" py={10} color="gray.500">
                참여 중인 시험이 없습니다.
              </Box>
            )}
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
