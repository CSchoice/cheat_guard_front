import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { FiPlay, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

const ExamItem = ({ exam, onParticipate, onCancelParticipate }) => {
  const getExamStatus = (deadlineAt) => {
    const now = new Date();
    const deadline = new Date(deadlineAt);

    if (now < deadline) return { status: 'available', text: '시험 시작 가능' };
    return { status: 'completed', text: '시험 종료' };
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const status = getExamStatus(exam.deadlineAt);
  const isParticipating = exam.isParticipating;
  const isCompleted = exam.isCompleted;

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      _hover={{ shadow: 'sm' }}
    >
      <HStack justify="space-between" mb={2}>
        <Heading size="md">{exam.title}</Heading>
        <HStack spacing={2}>
          {!isCompleted && (
            <Badge colorScheme={status.status === 'available' ? 'blue' : 'gray'}>
              {status.text}
            </Badge>
          )}
          {isCompleted ? (
            <Badge colorScheme="red">시험 완료</Badge>
          ) : (
            isParticipating && <Badge colorScheme="green">참여 중</Badge>
          )}
        </HStack>
      </HStack>

      <VStack align="start" spacing={1} mb={3}>
        <Text fontSize="sm" color={textColor}>
          <strong>마감 기한:</strong> {formatDateTime(exam.deadlineAt)}
        </Text>
      </VStack>

      {isCompleted ? null : (
        <>
          {status.status === 'available' && !isParticipating && (
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<FiCheckCircle />}
              onClick={() => onParticipate(exam.id)}
              width="full"
            >
              시험 참여하기
            </Button>
          )}

          {isParticipating && status.status === 'available' && (
            <>
              <Button
                as={RouterLink}
                to={`/exam/${exam.id}`}
                colorScheme="green"
                size="sm"
                leftIcon={<FiPlay />}
                width="full"
              >
                시험 응시하기
              </Button>

              <Button
                colorScheme="red"
                variant="outline"
                size="sm"
                leftIcon={<FiXCircle />}
                onClick={() => onCancelParticipate(exam.id)}
                width="full"
                mt={2}
              >
                시험 참가 취소
              </Button>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ExamItem;