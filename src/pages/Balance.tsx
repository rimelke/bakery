import {
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { OrdersBalance } from '../electron/handlers/orders'
import api from '../services/api'

const Balance = () => {
  const dateTypes = {
    week: [
      moment().startOf('week').format(moment.HTML5_FMT.DATETIME_LOCAL),
      moment().endOf('week').format(moment.HTML5_FMT.DATETIME_LOCAL)
    ],
    month: [
      moment().startOf('month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      moment().endOf('month').format(moment.HTML5_FMT.DATETIME_LOCAL)
    ],
    year: [
      moment().startOf('year').format(moment.HTML5_FMT.DATETIME_LOCAL),
      moment().endOf('year').format(moment.HTML5_FMT.DATETIME_LOCAL)
    ],
    all: ['', '']
  }

  const [startDate, setStartDate] = useState(dateTypes.week[0])
  const [endDate, setEndDate] = useState(dateTypes.week[1])
  const [balance, setBalance] = useState<OrdersBalance>()

  useEffect(() => {
    const getBalance = async () => {
      const result = await api.orders.getOrdersBalance({ endDate, startDate })

      setBalance(result)
    }

    getBalance()
  }, [startDate, endDate])

  const getColor = (type: keyof typeof dateTypes) =>
    startDate === dateTypes[type][0] && endDate === dateTypes[type][1]
      ? 'cyan'
      : undefined

  const selectType = (type: keyof typeof dateTypes) => {
    setStartDate(dateTypes[type][0])
    setEndDate(dateTypes[type][1])
  }

  return (
    <Flex flexDir="column">
      <Flex gap={2} alignItems="center">
        <Input
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          w={52}
          bg="white"
          type="datetime-local"
        />
        <span>até</span>
        <Input
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          w={52}
          bg="white"
          type="datetime-local"
        />
      </Flex>
      <Flex mt={2} gap={2}>
        <Button
          onClick={() => selectType('week')}
          colorScheme={getColor('week')}>
          Semana
        </Button>
        <Button
          onClick={() => selectType('month')}
          colorScheme={getColor('month')}>
          Mês
        </Button>
        <Button
          onClick={() => selectType('year')}
          colorScheme={getColor('year')}>
          Ano
        </Button>
        <Button onClick={() => selectType('all')} colorScheme={getColor('all')}>
          Tudo
        </Button>
      </Flex>
      <Flex gap={8} mt={8}>
        <Flex
          flexDir="column"
          alignItems="center"
          bg="white"
          borderRadius="md"
          py={4}
          px={8}>
          <Text fontWeight={500}>Qtd. Vendas</Text>
          <Text fontWeight={600} fontSize="2xl">
            {balance?.ordersAmount.toLocaleString('pt-br')}
          </Text>
        </Flex>
        <Flex
          flexDir="column"
          alignItems="center"
          bg="white"
          borderRadius="md"
          py={4}
          px={8}>
          <Text fontWeight={500}>Faturamento</Text>
          <Text fontWeight={600} fontSize="2xl">
            {balance?.ordersTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </Text>
        </Flex>
        <Flex
          flexDir="column"
          alignItems="center"
          bg="white"
          borderRadius="md"
          py={4}
          px={8}>
          <Text fontWeight={500}>Lucro</Text>
          <Text fontWeight={600} fontSize="2xl">
            {balance?.profitTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </Text>
        </Flex>
        <Flex
          flexDir="column"
          alignItems="center"
          bg="white"
          borderRadius="md"
          py={4}
          px={8}>
          <Text fontWeight={500}>Margem</Text>
          <Text fontWeight={600} fontSize="2xl">
            {balance && balance.ordersTotal > 0
              ? (balance.profitTotal / balance.ordersTotal).toLocaleString(
                  'pt-br',
                  {
                    style: 'percent',
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                  }
                )
              : '-'}
          </Text>
        </Flex>
      </Flex>

      <Table
        w="fit-content"
        mt={8}
        borderRadius="md"
        overflow="hidden"
        bg="white">
        <Thead bg="gray.100">
          <Tr>
            <Th isNumeric px={4} py={2}>
              Cód.
            </Th>
            <Th px={4} py={2}>
              Nome
            </Th>
            <Th isNumeric px={4} py={2}>
              Qtd.
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {balance?.items.map((item) => (
            <Tr key={item.code}>
              <Td isNumeric px={4} py={2}>
                {item.code}
              </Td>
              <Td px={4} py={2}>
                {item.name}
              </Td>
              <Td isNumeric px={4} py={2}>
                {item.amount.toLocaleString('pt-BR', {
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 3
                })}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  )
}

export default Balance
