import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Spinner,
  Center,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { examsApi } from '../api/exams';
import ExamList from '../components/dashboard/ExamList';

const MyExams = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchMyExams = async () => {
      try {
        setIsLoading(true);
        const response = await examsApi.getMyParticipatingExams();
        const myExams = Array.isArray(response) ? response : (response?.data || []);
        const withParticipation = myExams.map(exam => ({
          ...exam,
          isParticipating: true
        }));
        setExams(withParticipation);
      } catch (error) {
        console.error('내 시험 목록을 불러오는 중 오류 발생:', error);
        toast({
          title: '오류 발생',
          description: '내 시험 목록을 불러오는 중 오류가 발생했습니다.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyExams();
  }, [toast]);

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button
          as={RouterLink}
          to="/dashboard"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
        >
          대시보드로 돌아가기
        </Button>
      </Flex>

      <Heading size="lg" mb={6}>
        내가 참여한 시험 목록
      </Heading>

      {/* 검색 */}
      <Box mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="시험 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={bg}
            borderColor={borderColor}
          />
        </InputGroup>
      </Box>

      {/* 시험 목록 */}
      {filteredExams.length > 0 ? (
        <Box>
          <ExamList
            exams={filteredExams}
            onParticipate={() => {}}
            isLoading={false}
          />
        </Box>
      ) : (
        <Box textAlign="center" py={10} color="gray.500">
          {searchTerm ? '검색 결과가 없습니다.' : '참여 중인 시험이 없습니다.'}
        </Box>
      )}
    </Box>
  );
};

export default MyExams;
