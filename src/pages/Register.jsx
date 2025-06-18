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
  FormHelperText,
  FormErrorMessage,
  useColorModeValue,
  InputLeftElement
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = () => {
    const newErrors = {};
    
    // 닉네임 유효성 검사 (최소 3자)
    if (formData.nickname.length < 3) {
      newErrors.nickname = '닉네임은 최소 3자 이상이어야 합니다.';
    }
    
    // 비밀번호 유효성 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/;
    if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.';
    }
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register({
        nickname: formData.nickname,
        password: formData.password
      });
      
      toast({
        title: '회원가입 성공',
        description: '성공적으로 가입되었습니다!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/login');
    } catch (error) {
      console.error('회원가입 오류:', error);
      
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = '이미 사용 중인 닉네임입니다.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      toast({
        title: '회원가입 실패',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')} p={4}>
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
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading as="h1" size="xl" fontWeight="bold" mb={2}>
              회원가입
            </Heading>
            <Text fontSize="sm" color="gray.500">
              계정을 생성하고 모든 기능을 이용해보세요
            </Text>
          </Box>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl id="nickname" isRequired isInvalid={!!errors.nickname}>
                <FormLabel>닉네임</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiUser color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    type="text" 
                    name="nickname" 
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="닉네임을 입력하세요 (최소 3자)"
                  />
                </InputGroup>
                <FormHelperText>사용하실 닉네임을 입력해주세요</FormHelperText>
                {errors.nickname && (
                  <FormErrorMessage>{errors.nickname}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl id="password" isRequired isInvalid={!!errors.password}>
                <FormLabel>비밀번호</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiLock color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력하세요"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  영문, 숫자, 특수문자 포함 8자 이상
                </FormHelperText>
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
                <FormLabel>비밀번호 확인</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiLock color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                      icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.confirmPassword && (
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                )}
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                mt={4}
                isLoading={isLoading}
                loadingText="가입 중..."
              >
                회원가입
              </Button>
            </VStack>
          </form>
          
          <Text textAlign="center" mt={4}>
            이미 계정이 있으신가요?{' '}
            <ChakraLink as={RouterLink} to="/login" color="blue.500">
              로그인하기
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Register;
