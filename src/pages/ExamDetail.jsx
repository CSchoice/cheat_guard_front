import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/config';

const ExamDetail = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exams/${id}`);
        setExam(response.data);
      } catch (error) {
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
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={4} mb={6}>
        <Heading size="lg">{exam.title}</Heading>
        <Card variant="outline">
          <CardHeader>
            <Heading size="md">부정행위 로그</Heading>
          </CardHeader>
          <CardBody>
            {exam.cheatingLogs?.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>사유</Th>
                    <Th>발생 시각</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exam.cheatingLogs.map((log, index) => (
                    <Tr key={index}>
                      <Td>
                        <HStack>
                          <Icon as={FiAlertTriangle} />
                          <Text>{log.reason}</Text>
                        </HStack>
                      </Td>
                      <Td>{formatDate(log.detectedAt)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>기록된 부정행위 로그가 없습니다.</Text>
            )}
          </CardBody>
        </Card>

      </VStack>

      <Card variant="outline">
        <CardHeader>
          <Heading size="md">부정행위 로그</Heading>
        </CardHeader>
        <CardBody>
          {exam.logs?.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>참가자</Th>
                  <Th>내용</Th>
                  <Th>시간</Th>
                </Tr>
              </Thead>
              <Tbody>
                {exam.logs.map((log) => (
                  <Tr key={log.id}>
                    <Td>{log.user?.name || '-'}</Td>
                    <Td>
                      <HStack><Icon as={FiAlertTriangle} /><Text>{log.message}</Text></HStack>
                    </Td>
                    <Td>{formatDate(log.timestamp)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text>기록된 부정행위 로그가 없습니다.</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ExamDetail;
