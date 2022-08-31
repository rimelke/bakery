import { Button, Flex, Icon, Text } from '@chakra-ui/react'
import { FiHome, FiAlignLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Sidebar = () => (
  <Flex alignSelf="flex-start" pos="sticky" top={4} flexDir="column" gap={4}>
    <Button to="/" as={Link} py={6} display="flex" flexDir="column">
      <Icon as={FiHome} />
      <Text>Caixa</Text>
    </Button>
    <Button to="/orders" as={Link} py={6} display="flex" flexDir="column">
      <Icon as={FiAlignLeft} />
      <Text>Vendas</Text>
    </Button>
  </Flex>
)

export default Sidebar
