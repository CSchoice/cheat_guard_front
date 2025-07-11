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
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th width="30%">사유</Th>
                    <Th width="30%">발생 시각</Th>
                    <Th width="40%">이미지</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exam.cheatingLogs.map((log, index) => (
                    <Tr key={index}>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiAlertTriangle} color="red.500" />
                          <Text isTruncated maxW="300px">{log.reason}</Text>
                        </HStack>
                      </Td>
                      <Td whiteSpace="nowrap">{formatDate(log.detectedAt)}</Td>
                      <Td>
                        {log.imageUrl ? (
                          <img
                            src={log.imageUrl}
                            alt="부정행위"
                            style={{
                              width: '400px',
                              height: '300px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Text>이미지 없음</Text>
                        )}
                      </Td>
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
    </Box>
  );
};

export default ExamDetail;
