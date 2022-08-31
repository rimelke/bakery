import {
  Flex,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import { orders as Order } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import { GetOrdersParams } from '../electron/handlers/orders'
import api from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>()

  const filtersRef = useRef<Record<string, string>>({})

  const getOrders = async (filters?: GetOrdersParams) => {
    const result = await api.orders.getOrders(filters)

    setOrders(result)
  }

  useEffect(() => {
    getOrders()
  }, [])

  const handleChangeFilter = (key: keyof GetOrdersParams, value: string) => {
    if (value) filtersRef.current[key] = value
    else delete filtersRef.current[key]

    getOrders(filtersRef.current)
  }

  return (
    <Flex flexDir="column" gap={4}>
      <Flex gap={2} alignItems="center">
        <Select
          placeholder="Filtre por método de pgto."
          onChange={(e) => handleChangeFilter('paymentMethod', e.target.value)}
          w={64}
          bg="white">
          <option value="CARTÃO">CARTÃO</option>
          <option value="DINHEIRO">DINHEIRO</option>
          <option value="PIX">PIX</option>
        </Select>
        <Input
          ml={8}
          onChange={(e) => handleChangeFilter('startDate', e.target.value)}
          w={52}
          bg="white"
          type="datetime-local"
        />
        <span>até</span>
        <Input
          onChange={(e) => handleChangeFilter('endDate', e.target.value)}
          w={52}
          bg="white"
          type="datetime-local"
        />
      </Flex>
      <Table bg="white" borderRadius="md" overflow="hidden">
        <Thead bg="gray.100">
          <Tr>
            <Th px={4} py={2} isNumeric>
              #
            </Th>
            <Th px={4} py={2} isNumeric>
              Data
            </Th>
            <Th px={4} py={2}>
              Forma de pgto.
            </Th>
            <Th px={4} py={2} isNumeric>
              Qtd. Itens
            </Th>
            <Th px={4} py={2} isNumeric>
              Total
            </Th>
            <Th px={4} py={2} isNumeric>
              Valor pago
            </Th>
            <Th px={4} py={2} isNumeric>
              Troco
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders?.map((order) => (
            <Tr _hover={{ bg: 'cyan.100' }} key={order.id}>
              <Td px={4} py={2} isNumeric>
                {order.code}
              </Td>
              <Td px={4} py={2} isNumeric>
                {new Date(order.createdAt).toLocaleString('pt-br', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </Td>
              <Td px={4} py={2}>
                {order.paymentMethod}
              </Td>
              <Td px={4} py={2} isNumeric>
                {order.itemsAmount}
              </Td>
              <Td px={4} py={2} isNumeric>
                {order.total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </Td>
              <Td px={4} py={2} isNumeric>
                {order.paymentMethod === 'DINHEIRO'
                  ? order.paymentTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })
                  : '-'}
              </Td>
              <Td px={4} py={2} isNumeric>
                {order.paymentMethod === 'DINHEIRO' && order.paymentOver
                  ? order.paymentOver.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })
                  : '-'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  )
}

export default Orders
