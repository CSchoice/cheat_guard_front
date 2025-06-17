import React from 'react';
import { Box, Heading, Text, VStack, HStack, Avatar, Divider, Button } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>프로필</Heading>
      
      <VStack spacing={6} align="stretch" maxW="600px" mx="auto">
        <HStack spacing={4}>
          <Avatar size="xl" name={user?.name} />
          <VStack align="flex-start" spacing={1}>
            <Heading size="md">{user?.name || '사용자'}</Heading>
            <Text color="gray.500">{user?.email || '이메일 없음'}</Text>
            <Text fontSize="sm" color="gray.500">{user?.role === 'teacher' ? '선생님' : '학생'}</Text>
          </VStack>
        </HStack>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>계정 정보</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="bold">이름</Text>
              <Text>{user?.name || '없음'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">이메일</Text>
              <Text>{user?.email || '없음'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">역할</Text>
              <Text>{user?.role === 'teacher' ? '선생님' : '학생'}</Text>
            </HStack>
          </VStack>
        </Box>
        
        <Button colorScheme="blue" mt={4}>
          프로필 수정
        </Button>
      </VStack>
    </Box>
  );
};

export default Profile;
