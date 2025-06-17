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
  Select,
  FormHelperText,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    studentId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: '오류',
        description: '필수 항목을 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 비밀번호 일치 확인
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '오류',
        description: '비밀번호가 일치하지 않습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 비밀번호 길이 검증
    if (formData.password.length < 8) {
      toast({
        title: '오류',
        description: '비밀번호는 최소 8자 이상이어야 합니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 학생인 경우 학번 검증
    if (formData.role === 'student' && !formData.studentId) {
      toast({
        title: '오류',
        description: '학생의 경우 학번을 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
        ...(formData.role === 'student' && { studentId: formData.studentId })
      };
      
      const result = await register(userData);
      
      if (result.success) {
        toast({
          title: '회원가입 성공',
          description: '회원가입이 완료되었습니다. 로그인해주세요.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        throw new Error(result.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      toast({
        title: '회원가입 실패',
        description: error.message || '회원가입 중 오류가 발생했습니다.',
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
            계정 생성
          </Heading>
          <Text fontSize="md" color="gray.500">
            Cheat Guard 서비스를 시작하세요
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>이름</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  name="name"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
                <InputRightElement>
                  <FiUser color="gray.500" />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel>이메일</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  placeholder="비밀번호를 입력하세요 (8자 이상)"
                  value={formData.password}
                  onChange={handleChange}
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
              <FormHelperText>비밀번호는 8자 이상이어야 합니다.</FormHelperText>
            </FormControl>

            <FormControl id="confirmPassword" isRequired>
              <FormLabel>비밀번호 확인</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                    icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl id="phone">
              <FormLabel>전화번호 (선택사항)</FormLabel>
              <InputGroup>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="전화번호를 입력하세요"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <FiPhone color="gray.500" />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl id="role" isRequired>
              <FormLabel>역할</FormLabel>
              <Select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                placeholder="역할을 선택하세요"
              >
                <option value="student">학생</option>
                <option value="teacher">교사</option>
              </Select>
            </FormControl>

            {formData.role === 'student' && (
              <FormControl id="studentId" isRequired>
                <FormLabel>학번</FormLabel>
                <Input
                  type="text"
                  name="studentId"
                  placeholder="학번을 입력하세요"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </FormControl>
            )}

            <Button
              type="submit"
              colorScheme="brand"
              width="100%"
              size="lg"
              mt={4}
              isLoading={isLoading}
              loadingText="가입 중..."
              leftIcon={<FiLock />}
            >
              회원가입
            </Button>
          </VStack>
        </form>

        <Flex mt={6} justifyContent="center">
          <Text fontSize="sm" color="gray.500">
            이미 계정이 있으신가요?{' '}
            <ChakraLink as={RouterLink} to="/login" color="brand.500" fontWeight="medium">
              로그인
            </ChakraLink>
          </Text>
        </Flex>

        <Divider my={6} />
        
        <Text fontSize="sm" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} Cheat Guard. All rights reserved.
        </Text>
      </Box>
    </Flex>
  );
};

export default Register;
