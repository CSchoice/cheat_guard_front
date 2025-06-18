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
import { FiPlay, FiCheckCircle, FiX } from 'react-icons/fi';

const ExamItem = ({ 
  exam, 
  onParticipate, 
  onCancelParticipation,
  onStartExam,
  showParticipateButton = true,
  showStartButton = true,
  showCancelButton = false
}) => {
  const now = new Date();
  const deadline = new Date(exam.deadlineAt || exam.deadline);
  const isParticipating = exam.isParticipating || false;

  const formatDateTime = (dateString) => {
    if (!dateString) return '날짜 미정';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getExamStatus = () => {
    const startDate = new Date(exam.startDate || exam.createdAt);
    if (now < startDate) return { status: 'scheduled', text: '시험 예정' };
    if (now < deadline) return { status: 'in-progress', text: '시험 진행 중' };
    return { status: 'ended', text: '시험 종료' };
  };

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const status = getExamStatus();

  // 시험 상태에 따른 버튼 표시 로직
  const shouldShowParticipateButton = showParticipateButton && 
    status.status === 'scheduled' && 
    !isParticipating;
    
  const shouldShowStartButton = showStartButton && 
    status.status === 'in-progress' && 
    isParticipating;
    
  const shouldShowCancelButton = showCancelButton && 
    isParticipating && 
    (status.status === 'scheduled' || status.status === 'in-progress');

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
          <Badge
            colorScheme={
              status.status === 'scheduled' ? 'yellow' :
              status.status === 'in-progress' ? 'green' : 'gray'
            }
          >
            {status.text}
          </Badge>
          {isParticipating && <Badge colorScheme="blue">참여 중</Badge>}
        </HStack>
      </HStack>

      {exam.description && (
        <Text color={textColor} mb={3} noOfLines={2}>
          {exam.description}
        </Text>
      )}

      <VStack align="start" spacing={1} mb={3}>
        <Text fontSize="sm" color={textColor}>
          <strong>마감일:</strong> {formatDateTime(exam.deadlineAt || exam.deadline)}
        </Text>
        {exam.durationMinutes && (
          <Text fontSize="sm" color={textColor}>
            <strong>제한 시간:</strong> {exam.durationMinutes}분
          </Text>
        )}
      </VStack>

      <HStack mt={3} spacing={2} width="full">
        {/* 참여하기 버튼 - 시험 예정 상태이고 아직 참여하지 않은 경우 */}
        {shouldShowParticipateButton && (
          <Button
            colorScheme="blue"
            size="sm"
            leftIcon={<FiCheckCircle />}
            onClick={() => onParticipate && onParticipate(exam.id)}
            flex={1}
          >
            시험 참여하기
          </Button>
        )}

        {/* 시험 시작 버튼 - 시험 진행 중이고 참여 중인 경우 */}
        {shouldShowStartButton && (
          <Button
            colorScheme="green"
            size="sm"
            leftIcon={<FiPlay />}
            onClick={() => onStartExam && onStartExam(exam.id)}
            flex={1}
          >
            시험 시작
          </Button>
        )}

        {/* 참여 취소 버튼 - 참여 중이고 시험이 아직 종료되지 않은 경우 */}
        {shouldShowCancelButton && (
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            leftIcon={<FiX />}
            onClick={() => onCancelParticipation && onCancelParticipation(exam.id)}
            flex={1}
          >
            참여 취소
          </Button>
        )}

        {/* 시험 종료된 경우 메시지 표시 */}
        {status.status === 'ended' && (
          <Text fontSize="sm" color="gray.500" flex={1} textAlign="center">
            종료된 시험입니다
          </Text>
        )}
      </HStack>
    </Box>
  );
};

export default ExamItem;
