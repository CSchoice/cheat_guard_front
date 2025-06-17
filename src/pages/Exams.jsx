import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Text,
  Button,
  Badge,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
  Icon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { 
  FiSearch,
  FiCalendar, 
  FiClock,
  FiPlay,
  FiAlertCircle
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { examsApi } from '../api/exams';
import { useAuth } from '../contexts/AuthContext';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 시험 시작 처리
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

  // 시험 목록 가져오기
  useEffect(() => {
    let isMounted = true;
    
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching exams...');
        const data = await examsApi.getExams();
        console.log('Fetched exams:', data);
        
        if (!isMounted) return;
        
        // 현재 시간 기준으로 시험 상태 분류
        const now = new Date();
        const processedExams = data.map(exam => ({
          ...exam,
          status: new Date(exam.endedAt) < now ? 'ended' : 'available'
        }));
        
        console.log('Processed exams:', processedExams);
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

    fetchExams();
    
    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 플래그 설정
    };
  }, [toast]);

  // 검색어로 필터링
  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 시험 상태별로 분류
  const availableExams = filteredExams.filter(exam => exam.status === 'available');
  const endedExams = filteredExams.filter(exam => exam.status === 'ended');

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

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
        <Heading size="lg">시험 목록</Heading>
      </Flex>

      {/* 검색 */}
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

      {/* 시작 가능한 시험 */}
      {availableExams.length > 0 && (
        <>
          <Heading size="md" mb={4}>
            시작 가능한 시험
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
            {availableExams.map((exam) => (
              <Card key={exam.id} variant="outline">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Heading size="md">{exam.title}</Heading>
                    {exam.description && <Text>{exam.description}</Text>}
                    <VStack align="start" spacing={1} color="gray.600">
                      <HStack>
                        <Icon as={FiCalendar} />
                        <Text>시작: {formatDate(exam.startedAt)}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiClock} />
                        <Text>종료: {formatDate(exam.endedAt)}</Text>
                      </HStack>
                    </VStack>
                    <Button
                      colorScheme="blue"
                      leftIcon={<FiPlay />}
                      onClick={() => handleStartExam(exam.id)}
                      mt={2}
                    >
                      시험 시작하기
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
          <Divider my={6} />
        </>
      )}

      {/* 종료된 시험 */}
      {endedExams.length > 0 && (
        <>
          <Heading size="md" mb={4}>
            종료된 시험
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {endedExams.map((exam) => (
              <Card key={exam.id} variant="outline" opacity={0.7}>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Heading size="md">{exam.title}</Heading>
                    {exam.description && <Text>{exam.description}</Text>}
                    <VStack align="start" spacing={1} color="gray.500">
                      <HStack>
                        <Icon as={FiCalendar} />
                        <Text>종료됨: {formatDate(exam.endedAt)}</Text>
                      </HStack>
                    </VStack>
                    <Button
                      leftIcon={<FiAlertCircle />}
                      variant="outline"
                      isDisabled
                      mt={2}
                    >
                      종료된 시험
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      {/* 검색 결과가 없는 경우 */}
      {filteredExams.length === 0 && (
        <Center py={10} flexDirection="column">
          <Text fontSize="lg" color="gray.500" mb={4}>
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 시험이 없습니다.'}
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default Exams;
