import React from 'react';
import { Box, Flex, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <Box 
        flex="1" 
        overflow="auto" 
        ml={{ base: 0, md: 60 }} // 사이드바 너비만큼 왼쪽 마진 추가
        transition="margin 0.2s"
      >
        <Header onOpen={onOpen} />
        <Box p={6} bg={bg} minH="calc(100vh - 64px)">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;
