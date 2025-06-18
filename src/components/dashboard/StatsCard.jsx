import React from 'react';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';

const StatsCard = ({ title, value, icon, colorScheme = 'blue', helpText }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      position="relative"
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      boxShadow="sm"
      bg={bgColor}
    >
      <Stat>
        <StatLabel color={labelColor} fontSize="sm">
          {title}
        </StatLabel>
        <StatNumber fontSize="2xl" my={2}>
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText fontSize="xs" mb={0}>
            {helpText}
          </StatHelpText>
        )}
      </Stat>
      <Box position="absolute" right={4} bottom={4} opacity={0.1}>
        <Icon as={icon} boxSize={12} color={`${colorScheme}.500`} />
      </Box>
    </Box>
  );
};

export default StatsCard;
