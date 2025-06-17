import React from 'react';
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Link as ChakraLink,
  Icon,
  Text,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiFileText,
  FiUploadCloud,
  FiVideo,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const SidebarContent = ({ onClose, ...rest }) => {
  const { isTeacher } = useAuth();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const activeBg = useColorModeValue('gray.100', 'gray.700');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const NavItem = ({ icon, children, to, ...rest }) => {
    const isActive = location.pathname === to;
    return (
      <ChakraLink
        as={RouterLink}
        to={to}
        style={{ textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
      >
        <Box
          display="flex"
          alignItems="center"
          p="3"
          mx="3"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : 'inherit'}
          _hover={{
            bg: isActive ? activeBg : hoverBg,
            color: activeColor,
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: activeColor,
              }}
              as={icon}
            />
          )}
          {children}
        </Box>
      </ChakraLink>
    );
  };

  return (
    <Box
      transition="3s ease"
      bg={bg}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <VStack h="full" spacing={1} align="stretch">
        <Box p={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Cheat Guard
          </Text>
        </Box>
        
        <Divider />
        
        <VStack spacing={1} align="stretch" flex={1} overflowY="auto" py={4}>
          <NavItem icon={FiHome} to="/dashboard" onClick={onClose}>
            대시보드
          </NavItem>
          
          <NavItem icon={FiFileText} to="/exams" onClick={onClose}>
            시험 관리
          </NavItem>
          
          {isTeacher && (
            <>
              <NavItem icon={FiUploadCloud} to="/analyzer" onClick={onClose}>
                분석기
              </NavItem>
              
              <NavItem icon={FiVideo} to="/streaming" onClick={onClose}>
                스트리밍
              </NavItem>
            </>
          )}
        </VStack>
        
        <Box p={4} borderTopWidth={1}>
          <NavItem icon={FiUser} to="/profile" onClick={onClose}>
            내 프로필
          </NavItem>
          
          <NavItem icon={FiSettings} to="/settings" onClick={onClose}>
            설정
          </NavItem>
        </Box>
      </VStack>
    </Box>
  );
};

const Sidebar = ({ isOpen, onClose, ...rest }) => {
  return (
    <Box>
      {/* 모바일 사이드바 */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>메뉴</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* 데스크톱 사이드바 */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w={60}
        h="100vh"
        position="fixed"
        left={0}
        top={0}
        {...rest}
      >
        <SidebarContent onClose={onClose} />
      </Box>
    </Box>
  );
};

export default Sidebar;
