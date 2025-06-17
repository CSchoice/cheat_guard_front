import React from 'react';
import { 
  Box, 
  Flex, 
  IconButton, 
  useColorMode, 
  useColorModeValue, 
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  HStack,
  useDisclosure
} from '@chakra-ui/react';
import { FiMenu, FiMoon, FiSun, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onOpen }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      bg={bg} 
      borderBottom="1px" 
      borderColor={borderColor}
      px={4} 
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <HStack spacing={4}>
          <IconButton
            icon={<FiMenu />}
            variant="ghost"
            onClick={onOpen}
            aria-label="메뉴 열기"
            display={{ base: 'flex', md: 'none' }}
          />
          <Text fontSize="xl" fontWeight="bold">
            Cheat Guard
          </Text>
        </HStack>

        <HStack spacing={4}>
          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label={colorMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          />
          
          <Menu>
            <MenuButton>
              <Avatar 
                size="sm" 
                name={user?.name} 
                src={user?.avatar} 
                cursor="pointer"
              />
            </MenuButton>
            <MenuList>
              <MenuItem as={Link} to="/profile" icon={<FiUser />}>
                프로필
              </MenuItem>
              <MenuItem icon={<FiSettings />}>
                설정
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                로그아웃
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
