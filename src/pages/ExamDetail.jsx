import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Badge, 
  Divider, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiClock,
  FiCalendar,
  FiUsers,
  FiAlertTriangle,
  FiDownload
} from 'react-icons/fi';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ExamDetail = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 시험 정보 불러오기
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exams/${id}`);
        setExam(response.data);
      } catch (error) {
        console.error('시험 정보를 불러오는 중 오류 발생:', error);
        toast({
          title: '오류',
          description: '시험 정보를 불러오는 중 오류가 발생했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/exams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [id, navigate, toast]);

  // 시험 삭제 핸들러
  const handleDelete = async () => {
    try {
      await api.delete(`/exams/${id}`);
      toast({
        title: '성공',
        description: '시험이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/exams');
    } catch (error) {
      console.error('시험 삭제 중 오류 발생:', error);
      toast({
        title: '오류',
        description: '시험 삭제 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 시험 상태 확인
  const getExamStatus = () => {
    if (!exam) return { status: 'unknown', label: '알 수 없음', color: 'gray' };
    
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (now < startTime) {
      return { status: 'upcoming', label: '예정', color: 'blue' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'in-progress', label: '진행 중', color: 'green' };
    } else {
      return { status: 'completed', label: '종료', color: 'gray' };
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '알 수 없음';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }


  if (!exam) {
    return (
      <Box p={4} textAlign="center">
        <Text>시험을 찾을 수 없습니다.</Text>
        <Button as={RouterLink} to="/exams" mt={4} leftIcon={<FiArrowLeft />}>
          시험 목록으로
        </Button>
      </Box>
    );
  }

  const status = getExamStatus();
  const isTeacher = user?.role === 'teacher';

  return (
    <Box p={4}>
      {/* 헤더 */}
      <VStack align="stretch" spacing={4} mb={6}>
        <HStack justify="space-between" align="center">
          <HStack>
            <Button 
              as={RouterLink} 
              to="/exams" 
              variant="ghost" 
              leftIcon={<FiArrowLeft />}
            >
              뒤로
            </Button>
            <Heading size="lg">{exam.title}</Heading>
            <Badge colorScheme={status.color} fontSize="md">
              {status.label}
            </Badge>
          </HStack>
          
          <HStack>
            {isTeacher && (
              <>
                <Button 
                  as={RouterLink}
                  to={`/exams/${id}/edit`}
                  leftIcon={<FiEdit2 />}
                  colorScheme="blue"
                  variant="outline"
                >
                  수정
                </Button>
                <Button 
                  leftIcon={<FiTrash2 />}
                  colorScheme="red"
                  variant="outline"
                  onClick={onOpen}
                >
                  삭제
                </Button>
              </>
            )}
            
            {status.status === 'in-progress' && isTeacher && (
              <Button 
                leftIcon={<FiAlertTriangle />}
                colorScheme="green"
                onClick={() => navigate(`/exams/${id}/monitor`)}
              >
                모니터링
              </Button>
            )}
            
            {status.status === 'completed' && (
              <Button 
                leftIcon={<FiDownload />}
                colorScheme="blue"
                onClick={() => {
                  // 결과 다운로드 기능
                  toast({
                    title: '기능 준비 중',
                    description: '이 기능은 곧 제공될 예정입니다.',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                결과 내보내기
              </Button>
            )}
          </HStack>
        </HStack>
        
        {/* 시험 정보 요약 */}
        <Card variant="outline">
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <VStack align="flex-start" spacing={1}>
                <HStack color="gray.500">
                  <Icon as={FiCalendar} />
                  <Text fontSize="sm">시작 일시</Text>
                </HStack>
                <Text fontWeight="medium">
                  {formatDate(exam.startTime)}
                </Text>
              </VStack>
              
              <VStack align="flex-start" spacing={1}>
                <HStack color="gray.500">
                  <Icon as={FiClock} />
                  <Text fontSize="sm">종료 일시</Text>
                </HStack>
                <Text fontWeight="medium">
                  {formatDate(exam.endTime)}
                </Text>
              </VStack>
              
              <VStack align="flex-start" spacing={1}>
                <HStack color="gray.500">
                  <Icon as={FiUsers} />
                  <Text fontSize="sm">참가자</Text>
                </HStack>
                <Text fontWeight="medium">
                  {exam.participants?.length || 0}명
                </Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>

      {/* 탭 패널 */}
      <Tabs variant="enclosed">
        <TabList>
          <Tab>개요</Tab>
          <Tab isDisabled={!exam.participants?.length}>
            참가자 ({exam.participants?.length || 0})
          </Tab>
          <Tab isDisabled={status.status !== 'completed'}>
            결과 분석
          </Tab>
        </TabList>

        <TabPanels mt={4}>
          {/* 개요 탭 */}
          <TabPanel p={0}>
            <Card variant="outline" mb={6}>
              <CardHeader>
                <Heading size="md">시험 개요</Heading>
              </CardHeader>
              <CardBody>
                <Text>{exam.description || '설명이 없습니다.'}</Text>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <Heading size="md">시험 정보</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>과목</Text>
                    <Text>{exam.subject || '미지정'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>생성일</Text>
                    <Text>{formatDate(exam.createdAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>수정일</Text>
                    <Text>{formatDate(exam.updatedAt)}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 참가자 탭 */}
          <TabPanel p={0}>
            <Card variant="outline">
              <CardHeader>
                <Heading size="md">참가자 목록</Heading>
              </CardHeader>
              <CardBody>
                {exam.participants?.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>이름</Th>
                        <Th>상태</Th>
                        <Th>점수</Th>
                        <Th>제출 일시</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {exam.participants.map((participant) => (
                        <Tr key={participant.id}>
                          <Td>{participant.name}</Td>
                          <Td>
                            <Badge colorScheme="green">완료</Badge>
                          </Td>
                          <Td>{participant.score || '-'}</Td>
                          <Td>{formatDate(participant.submittedAt)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text>아직 참가자가 없습니다.</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* 결과 분석 탭 */}
          <TabPanel p={0}>
            <Card variant="outline">
              <CardHeader>
                <Heading size="md">결과 분석</Heading>
              </CardHeader>
              <CardBody>
                <Text>시험이 종료된 후에 결과를 확인할 수 있습니다.</Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              시험 삭제
            </AlertDialogHeader>

            <AlertDialogBody>
              정말로 이 시험을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ExamDetail;
