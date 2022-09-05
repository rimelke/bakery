import { Button, Flex, Icon, Text } from '@chakra-ui/react'
import {
  FiHome,
  FiAlignLeft,
  FiArchive,
  FiBarChart,
  FiSettings
} from 'react-icons/fi'
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
    <Button to="/products" as={Link} py={6} display="flex" flexDir="column">
      <Icon as={FiArchive} />
      <Text>Produtos</Text>
    </Button>
    <Button to="/balance" as={Link} py={6} display="flex" flexDir="column">
      <Icon as={FiBarChart} />
      <Text>Balanço</Text>
    </Button>
    <Button to="/settings" as={Link} py={6} display="flex" flexDir="column">
      <Icon as={FiSettings} />
      <Text>Ajustes</Text>
    </Button>
  </Flex>
)

export default Sidebar
