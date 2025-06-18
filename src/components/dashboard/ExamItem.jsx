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
import { FiPlay, FiCheckCircle } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

const ExamItem = ({ exam, onParticipate }) => {
  const getExamStatus = (startAt, endAt) => {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);
    
    if (now < start) return { status: 'scheduled', text: '시험 예정' };
    if (now >= start && now <= end) return { status: 'in-progress', text: '시험 진행 중' };
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

  const status = getExamStatus(exam.startedAt, exam.endedAt);
  const isParticipating = exam.isParticipating;
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
          <Badge 
            colorScheme={
              status.status === 'scheduled' ? 'blue' : 
              status.status === 'in-progress' ? 'green' : 'gray'
            }
          >
            {status.text}
          </Badge>
          {isParticipating && (
            <Badge colorScheme="green">참여 중</Badge>
          )}
        </HStack>
      </HStack>
      
      <VStack align="start" spacing={1} mb={3}>
        <Text fontSize="sm" color={textColor}>
          <strong>시작:</strong> {formatDateTime(exam.startedAt)}
        </Text>
        <Text fontSize="sm" color={textColor}>
          <strong>종료:</strong> {formatDateTime(exam.endedAt)}
        </Text>
      </VStack>
      
      {status.status === 'scheduled' && !isParticipating && (
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
      
      {isParticipating && status.status === 'in-progress' && (
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
      )}
    </Box>
  );
};

export default ExamItem;
