import React from "react";
import { Button, useColorModeValue, Tooltip, Flex } from "@chakra-ui/react";
import { GraphContext } from "../../MapContext";

// Toggle para alternar entre Modo Cursar y Modo Rendir Final
const ModeToggle = () => {
  const { currentMode, setCurrentMode } = React.useContext(GraphContext);

  const activeBg = useColorModeValue("blue.500", "blue.600");
  const activeColor = "white";
  const inactiveBg = useColorModeValue("gray.200", "gray.700");
  const inactiveColor = useColorModeValue("gray.700", "gray.300");
  const hoverBg = useColorModeValue("gray.300", "gray.600");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  
  const cursarTooltip = currentMode === "cursar" 
    ? "Viendo requisitos para Cursar" 
    : "Cambiar a requisitos para Cursar";
  
  const rendirTooltip = currentMode === "rendir" 
    ? "Viendo requisitos para Rendir Final" 
    : "Cambiar a requisitos para Rendir Final";

  return (
    <Flex
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue("gray.100", "gray.800")}
      p="2px"
    >
      <Tooltip label={cursarTooltip} placement="bottom">
        <Button
          size="sm"
          variant="ghost"
          bg={currentMode === "cursar" ? activeBg : "transparent"}
          color={currentMode === "cursar" ? activeColor : inactiveColor}
          onClick={() => currentMode !== "cursar" && setCurrentMode("cursar")}
          _hover={{
            bg: currentMode === "cursar" ? "blue.600" : hoverBg,
          }}
          borderRadius="md"
          fontWeight={currentMode === "cursar" ? "bold" : "normal"}
          transition="all 0.2s"
        >
          Cursar
        </Button>
      </Tooltip>
      <Tooltip label={rendirTooltip} placement="bottom">
        <Button
          size="sm"
          variant="ghost"
          bg={currentMode === "rendir" ? activeBg : "transparent"}
          color={currentMode === "rendir" ? activeColor : inactiveColor}
          onClick={() => currentMode !== "rendir" && setCurrentMode("rendir")}
          _hover={{
            bg: currentMode === "rendir" ? "blue.600" : hoverBg,
          }}
          borderRadius="md"
          fontWeight={currentMode === "rendir" ? "bold" : "normal"}
          transition="all 0.2s"
        >
          Rendir Final
        </Button>
      </Tooltip>
    </Flex>
  );
};

export default ModeToggle;
