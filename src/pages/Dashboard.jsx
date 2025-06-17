import React, { useState, useEffect } from 'react';
import { 
  Box, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  useColorModeValue,
  Icon,
  HStack,
  VStack,
  Badge,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { 
  FiCalendar, 
  FiUsers, 
  FiFileText, 
  FiAlertCircle, 
  FiClock,
  FiCheckCircle,
  FiBarChart2
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { examsApi } from '../api/exams';

// 상태 타입 정의
const ExamStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// 샘플 데이터 (API 호출 실패 시 사용)
const defaultStats = {
  totalExams: 0,
  activeExams: 0,
  students: 0,
  cheatingAttempts: 0,
};

const defaultActivities = [];

const upcomingExams = [
  { id: 1, title: '기말고사', date: '2023-06-20', time: '09:00 - 12:00', status: 'upcoming' },
  { id: 2, title: '과제 제출', date: '2023-06-15', time: '23:59', status: 'upcoming' },
];

const Dashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [recentActivities, setRecentActivities] = useState(defaultActivities);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // 시험 목록 가져오기
        const exams = await examsApi.getExams();
        
        // 통계 데이터 계산
        const totalExams = exams.length;
        const activeExams = exams.filter(
          exam => exam.status === ExamStatus.IN_PROGRESS
        ).length;
        
        // TODO: 학생 수와 부정행위 시도 수는 백엔드에서 제공해야 함
        const students = 0;
        const cheatingAttempts = 0;

        setStats({
          totalExams,
          activeExams,
          students,
          cheatingAttempts,
        });

        // 최근 활동 내역 (최근 5개 시험)
        const recentExams = exams
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(exam => ({
            id: exam.id,
            type: 'exam',
            title: exam.title,
            date: exam.startTime,
            status: exam.status
          }));

        setRecentActivities(recentExams);
      } catch (error) {
        console.error('대시보드 데이터를 불러오는 중 오류 발생:', error);
        toast({
          title: '오류 발생',
          description: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge colorScheme="green">완료</Badge>;
      case 'upcoming':
        return <Badge colorScheme="blue">예정</Badge>;
      case 'in-progress':
        return <Badge colorScheme="yellow">진행 중</Badge>;
      case 'warning':
        return <Badge colorScheme="red">주의 필요</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam':
        return <Icon as={FiFileText} color="blue.500" />;
      case 'alert':
        return <Icon as={FiAlertCircle} color="red.500" />;
      default:
        return <Icon as={FiBarChart2} color="gray.500" />;
    }
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={6}>
        {/* 환영 메시지 */}
        <Box>
          <Heading size="lg" mb={2}>
            안녕하세요, {user?.name}님!
          </Heading>
          <Text color="gray.500">
            오늘의 활동을 확인하고 시험을 관리하세요.
          </Text>
        </Box>

        {/* 통계 카드 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>총 시험 수</StatLabel>
                <StatNumber>{stats.totalExams}</StatNumber>
                <StatHelpText>
                  전체 등록된 시험 수
                </StatHelpText>
              </Stat>
              <Icon as={FiFileText} w={8} h={8} color="blue.500" mt={2} />
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>진행 중인 시험</StatLabel>
                <StatNumber>{stats.activeExams}</StatNumber>
                <StatHelpText>
                  현재 진행 중인 시험 수
                </StatHelpText>
              </Stat>
              <Icon as={FiClock} w={8} h={8} color="yellow.500" mt={2} />
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>학생 수</StatLabel>
                <StatNumber>{stats.students}</StatNumber>
                <StatHelpText>
                  전체 등록된 학생 수
                </StatHelpText>
              </Stat>
              <Icon as={FiUsers} w={8} h={8} color="green.500" mt={2} />
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>부정행위 시도</StatLabel>
                <StatNumber>{stats.cheatingAttempts}</StatNumber>
                <StatHelpText>
                  총 감지된 부정행위 시도 수
                </StatHelpText>
              </Stat>
              <Icon as={FiAlertCircle} w={8} h={8} color="red.500" mt={2} />
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* 최근 활동 */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader pb={2}>
              <Heading size="md">최근 활동</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {recentActivities.map((activity) => (
                  <Box 
                    key={activity.id}
                    p={3} 
                    borderRadius="md"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        {getActivityIcon(activity.type)}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{activity.title}</Text>
                          <Text fontSize="sm" color="gray.500">{activity.date}</Text>
                        </VStack>
                      </HStack>
                      {getStatusBadge(activity.status)}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
            <CardFooter>
              <Button as={RouterLink} to="/exams" size="sm" colorScheme="blue" variant="outline">
                자세히 보기
              </Button>
            </CardFooter>
          </Card>

          {/* 다가오는 시험 */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader pb={2}>
              <Heading size="md">다가오는 시험</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {upcomingExams.map((exam) => (
                  <Box 
                    key={exam.id}
                    p={3} 
                    borderRadius="md"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">{exam.title}</Text>
                      {getStatusBadge(exam.status)}
                    </HStack>
                    <HStack spacing={4} color="gray.500" fontSize="sm">
                      <HStack>
                        <Icon as={FiCalendar} />
                        <Text>{exam.date}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiClock} />
                        <Text>{exam.time}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
            <CardFooter>
              <Button 
                leftIcon={<FiCheckCircle />} 
                colorScheme="blue" 
                as={RouterLink} 
                to="/exams"
              >
                모든 시험 보기
              </Button>
            </CardFooter>
          </Card>
        </SimpleGrid>

        {/* 교사 전용 섹션 */}
        {user?.role === 'teacher' && (
          <Card bg={cardBg} border="1px" borderColor={borderColor} mt={4}>
            <CardHeader>
              <Heading size="md">교사 도구</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Button 
                  leftIcon={<FiFileText />} 
                  as={RouterLink} 
                  to="/exams/new"
                  colorScheme="blue"
                  variant="outline"
                  height="100px"
                >
                  새 시험 생성
                </Button>
                <Button 
                  leftIcon={<FiAlertCircle />} 
                  as={RouterLink} 
                  to="/analyzer"
                  colorScheme="red"
                  variant="outline"
                  height="100px"
                >
                  부정행위 분석
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default Dashboard;
