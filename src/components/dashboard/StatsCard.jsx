import React from 'react';
import { Stat, StatLabel, StatNumber, StatHelpText, Box, Icon } from '@chakra-ui/react';

const StatsCard = ({ title, value, icon, colorScheme, helpText }) => {
  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg"
      borderColor="gray.200"
      boxShadow="sm"
      bg="white"
    >
      <Stat>
        <StatLabel color="gray.600" fontSize="sm">{title}</StatLabel>
        <StatNumber fontSize="2xl" my={2}>{value}</StatNumber>
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
