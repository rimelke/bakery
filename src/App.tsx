import { Box, ChakraProvider, extendTheme, Flex } from '@chakra-ui/react'
import { HashRouter } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { BackupProvider } from './contexts/BackupContext'
import Routes from './Routes'

const activeLabelStyles = {
  transform: 'scale(0.85) translateY(-24px)'
}

const theme = extendTheme({
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles
              }
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label':
              {
                ...activeLabelStyles
              },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'white',
              pointerEvents: 'none',
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: 'left top'
            }
          }
        }
      }
    }
  }
})

const App = () => (
  <ChakraProvider theme={theme}>
    <BackupProvider>
      <HashRouter>
        <Flex bg="gray.200" minH="100vh" p={4} gap={8}>
          <Sidebar />
          <Box flex={1}>
            <Routes />
          </Box>
        </Flex>
      </HashRouter>
    </BackupProvider>
  </ChakraProvider>
)

export default App
