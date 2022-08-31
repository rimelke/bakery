import { Box, ChakraProvider, Flex } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Routes from './Routes'

const App = () => (
  <ChakraProvider>
    <BrowserRouter>
      <Flex bg="gray.200" minH="100vh" p={4} gap={8}>
        <Sidebar />
        <Box flex={1}>
          <Routes />
        </Box>
      </Flex>
    </BrowserRouter>
  </ChakraProvider>
)

export default App
