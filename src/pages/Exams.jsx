import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Button,
  Badge,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiClock, 
  FiUsers,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useAlertDisclosure();
  const [examToDelete, setExamToDelete] = useState(null);
  const cancelRef = React.useRef();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // 시험 목록 불러오기
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exams');
        setExams(response.data);
        setFilteredExams(response.data);
      } catch (error) {
        console.error('시험 목록을 불러오는 중 오류 발생:', error);
        toast({
          title: '오류',
          description: '시험 목록을 불러오는 중 오류가 발생했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [toast]);

  // 검색 및 필터링 적용
  useEffect(() => {
    let result = [...exams];

    // 검색어 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(exam => 
        exam.title.toLowerCase().includes(term) || 
        exam.description?.toLowerCase().includes(term) ||
        exam.subject?.toLowerCase().includes(term)
      );
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      const now = new Date();
      result = result.filter(exam => {
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        
        if (statusFilter === 'upcoming') return startTime > now;
        if (statusFilter === 'in-progress') return startTime <= now && endTime >= now;
        if (statusFilter === 'completed') return endTime < now;
        return true;
      });
    }

    // 정렬
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      return 0;
    });

    setFilteredExams(result);
  }, [exams, searchTerm, statusFilter, sortBy]);

  // 시험 삭제 핸들러
  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    try {
      await api.delete(`/exams/${examToDelete.id}`);
      
      setExams(prevExams => prevExams.filter(exam => exam.id !== examToDelete.id));
      
      toast({
        title: '시험이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('시험 삭제 중 오류 발생:', error);
      toast({
        title: '오류',
        description: '시험을 삭제하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
      setExamToDelete(null);
    }
  };

  // 시험 상태 반환 (예정, 진행 중, 종료)
  const getExamStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return { status: 'upcoming', label: '예정', color: 'blue' };
    if (now >= start && now <= end) return { status: 'in-progress', label: '진행 중', color: 'green' };
    return { status: 'completed', label: '종료', color: 'gray' };
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 시험 기간 포맷팅
  const formatExamPeriod = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const isSameDay = start.toDateString() === end.toDateString();
    
    if (isSameDay) {
      return `${start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} 
              ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} ~ 
              ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return `${start.toLocaleString('ko-KR')} ~ ${end.toLocaleString('ko-KR')}`;
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>로딩 중...</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">시험 관리</Heading>
        {user?.role === 'teacher' && (
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="blue"
            as={RouterLink}
            to="/exams/new"
          >
            새 시험 생성
          </Button>
        )}
      </Flex>

      {/* 검색 및 필터 섹션 */}
      <Card mb={6} bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box>
              <Text mb={2} fontWeight="medium">검색</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="시험명, 설명, 과목으로 검색" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Box>
            
            <Box>
              <Text mb={2} fontWeight="medium">상태</Text>
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                leftIcon={<FiFilter />}
              >
                <option value="all">모든 상태</option>
                <option value="upcoming">예정된 시험</option>
                <option value="in-progress">진행 중인 시험</option>
                <option value="completed">종료된 시험</option>
              </Select>
            </Box>
            
            <Box>
              <Text mb={2} fontWeight="medium">정렬</Text>
              <Select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="title-asc">제목 (가나다순)</option>
                <option value="title-desc">제목 (역순)</option>
              </Select>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* 시험 목록 */}
      {filteredExams.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            {searchTerm || statusFilter !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '등록된 시험이 없습니다.'}
          </Text>
          {user?.role === 'teacher' && (
            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="blue"
              as={RouterLink}
              to="/exams/new"
            >
              새 시험 생성하기
            </Button>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam.startTime, exam.endTime);
            
            return (
              <Card 
                key={exam.id} 
                bg={cardBg} 
                border="1px" 
                borderColor={borderColor}
                _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="flex-start">
                    <Heading size="md" noOfLines={1} flex={1} mr={2}>
                      {exam.title}
                    </Heading>
                    {user?.role === 'teacher' && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<FiEye />} 
                            as={RouterLink}
                            to={`/exams/${exam.id}`}
                          >
                            상세 보기
                          </MenuItem>
                          <MenuItem 
                            icon={<FiEdit2 />} 
                            as={RouterLink}
                            to={`/exams/${exam.id}/edit`}
                          >
                            수정
                          </MenuItem>
                          <MenuItem 
                            icon={<FiTrash2 />} 
                            color="red.500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExamToDelete(exam);
                              onDeleteOpen();
                            }}
                          >
                            삭제
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </Flex>
                  <HStack mt={2} spacing={2}>
                    <Badge colorScheme={status.color}>
                      {status.label}
                    </Badge>
                    {exam.subject && (
                      <Badge colorScheme="purple" variant="outline">
                        {exam.subject}
                      </Badge>
                    )}
                  </HStack>
                </CardHeader>
                
                <CardBody pt={2} pb={4}>
                  <VStack align="stretch" spacing={3}>
                    {exam.description && (
                      <Text noOfLines={3} color="gray.600" fontSize="sm">
                        {exam.description}
                      </Text>
                    )}
                    
                    <Box 
                      p={3} 
                      bg={hoverBg} 
                      borderRadius="md"
                      borderLeft="4px"
                      borderLeftColor={`${status.color}.500`}
                    >
                      <VStack align="stretch" spacing={1}>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.500" />
                          <Text fontSize="sm" color="gray.700">
                            {formatDate(exam.startTime)}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiClock} color="gray.500" />
                          <Text fontSize="sm" color="gray.700">
                            {formatExamPeriod(exam.startTime, exam.endTime)}
                          </Text>
                        </HStack>
                        {exam.participants && (
                          <HStack>
                            <Icon as={FiUsers} color="gray.500" />
                            <Text fontSize="sm" color="gray.700">
                              {exam.participants.length}명 참여
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
                
                <CardFooter pt={0}>
                  <Button 
                    width="100%" 
                    variant="outline" 
                    colorScheme="blue"
                    as={RouterLink}
                    to={`/exams/${exam.id}`}
                  >
                    {status.status === 'completed' ? '결과 보기' : '시험 보기'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              시험 삭제
            </AlertDialogHeader>

            <AlertDialogBody>
              정말로 "{examToDelete?.title}" 시험을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                취소
              </Button>
              <Button colorScheme="red" onClick={handleDeleteExam} ml={3}>
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Exams;
