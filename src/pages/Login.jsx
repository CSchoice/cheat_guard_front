import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  InputGroup, 
  InputRightElement, 
  IconButton, 
  Text, 
  Link as ChakraLink,
  useToast,
  VStack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: '오류',
        description: '이메일과 비밀번호를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: '로그인 성공',
          description: '성공적으로 로그인되었습니다.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        throw new Error(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      toast({
        title: '로그인 실패',
        description: error.message || '로그인 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        w="100%"
        maxW="md"
        p={8}
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg={bg}
        borderColor={borderColor}
      >
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl" mb={2}>
            Cheat Guard
          </Heading>
          <Text fontSize="lg" color="gray.500">
            부정행위 방지 시스템에 로그인하세요
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>이메일</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <InputRightElement>
                  <FiMail color="gray.500" />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>비밀번호</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              width="100%"
              size="lg"
              mt={4}
              isLoading={isLoading}
              loadingText="로그인 중..."
              leftIcon={<FiLock />}
            >
              로그인
            </Button>
          </VStack>
        </form>

        <Flex mt={6} justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.500">
            아직 계정이 없으신가요?{' '}
            <ChakraLink as={RouterLink} to="/register" color="brand.500" fontWeight="medium">
              회원가입
            </ChakraLink>
          </Text>
          
          <ChakraLink 
            as={RouterLink} 
            to="/forgot-password" 
            fontSize="sm" 
            color="gray.500"
            _hover={{ textDecoration: 'underline' }}
          >
            비밀번호 찾기
          </ChakraLink>
        </Flex>

        <Divider my={6} />
        
        <Text fontSize="sm" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} Cheat Guard. All rights reserved.
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
