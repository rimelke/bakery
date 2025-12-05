import { FC } from 'react'
import {
  FiAlignLeft,
  FiArchive,
  FiBarChart,
  FiHome,
  FiSettings
} from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { Button, Flex, Icon, Text } from '@chakra-ui/react'

const sidebarLinks: {
  to: string
  icon: FC
  label: string
}[] = [
  { to: '/', icon: FiHome, label: 'Caixa' },
  { to: '/orders', icon: FiAlignLeft, label: 'Vendas' },
  { to: '/products', icon: FiArchive, label: 'Produtos' },
  { to: '/balance', icon: FiBarChart, label: 'Balanço' },
  { to: '/settings', icon: FiSettings, label: 'Ajustes' }
]

const Sidebar = () => {
  const { pathname } = useLocation()

  return (
    <Flex alignSelf="flex-start" pos="sticky" top={4} flexDir="column" gap={4}>
      {sidebarLinks.map(({ to, icon, label }) => (
        <Button
          key={to}
          as={Link}
          to={to}
          py={6}
          display="flex"
          flexDir="column"
          colorScheme={pathname === to ? 'teal' : 'gray'}>
          <Icon as={icon} />
          <Text>{label}</Text>
        </Button>
      ))}
    </Flex>
  )
}

export default Sidebar
