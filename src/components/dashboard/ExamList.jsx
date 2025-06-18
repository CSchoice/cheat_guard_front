import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Box
} from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import ExamItem from './ExamItem';

const ExamList = ({ exams, onParticipate, onCancelParticipate, isLoading }) => {
  const [showAll, setShowAll] = useState(false);
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const displayedExams = showAll ? exams : exams.slice(0, 5);

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text>시험 목록을 불러오는 중입니다...</Text>
      </Box>
    );
  }

  return (
    <Card bg={cardBg}>
      <CardHeader display="flex" justifyContent="space-between" alignItems="center">
        <Box as="h2" fontSize="lg" fontWeight="bold">시험 목록</Box>
        {!showAll && exams.length > 5 && (
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<FiArrowRight />}
            onClick={() => setShowAll(true)}
          >
            전체보기
          </Button>
        )}
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {displayedExams.length > 0 ? (
            displayedExams.map((exam) => (
              <ExamItem
                key={exam.id}
                exam={exam}
                onParticipate={onParticipate}
                onCancelParticipate={onCancelParticipate} // ✅ 추가됨
              />
            ))
          ) : (
            <Text color={emptyTextColor} textAlign="center" py={4}>
              등록된 시험이 없습니다.
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ExamList;
