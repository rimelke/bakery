import { useEffect, useRef, useState } from 'react'
import { FiEye, FiTrash2 } from 'react-icons/fi'
import { GrRevert } from 'react-icons/gr'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import { GetOrdersParams } from '../electron/handlers/orders'
import api from '../services/api'
import { Order, OrderItem } from '../types/order'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: string
}

const OrderModal = ({ isOpen, onClose, orderId }: OrderModalProps) => {
  const [order, setOrder] = useState<Order & { orderItems: OrderItem[] }>()

  useEffect(() => {
    if (!orderId) return

    const getOrder = async () => {
      const result = await api.orders.getOrder(orderId)

      if (result) setOrder(result)
      else setOrder(undefined)
    }

    getOrder()
  }, [orderId])

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Visualizar venda</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDir="column">
          <Flex gap={16} justifyContent="space-evenly">
            <Flex alignSelf="center" flexDir="column">
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Código:</Text>
                <Text>{order?.code}</Text>
              </Flex>
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Qtd. Itens:</Text>
                <Text>{order?.itemsAmount}</Text>
              </Flex>
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Total:</Text>
                <Text>
                  {order?.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Text>
              </Flex>
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Forma de pgto.:</Text>
                <Text>{order?.paymentMethod}</Text>
              </Flex>
            </Flex>
            <Flex alignSelf="center" flexDir="column">
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Pgto. Total:</Text>
                <Text>
                  {order?.paymentMethod === 'DINHEIRO'
                    ? order?.paymentTotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })
                    : '-'}
                </Text>
              </Flex>
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Troco:</Text>
                <Text>
                  {order?.paymentOver
                    ? order?.paymentOver.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })
                    : '-'}
                </Text>
              </Flex>
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Custo:</Text>
                <Text>
                  {order?.cost.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Text>
              </Flex>
              <Flex justifyContent="space-between" gap={8}>
                <Text fontWeight="medium">Lucro:</Text>
                <Text>
                  {order?.profit.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <Box mt={4} borderRadius="md" overflow="hidden" borderWidth="1px">
            <Table>
              <Thead bg="gray.100">
                <Tr>
                  <Th px={4} py={2} isNumeric>
                    #
                  </Th>
                  <Th px={4} py={2} isNumeric>
                    Cód.
                  </Th>
                  <Th px={4} py={2}>
                    Nome
                  </Th>
                  <Th px={4} py={2} isNumeric>
                    Qtd.
                  </Th>
                  <Th px={4} py={2} isNumeric>
                    Preço
                  </Th>
                  <Th px={4} py={2} isNumeric>
                    Subtotal
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {order?.orderItems.map((item) => (
                  <Tr key={item.itemCode}>
                    <Td px={4} py={2} isNumeric>
                      {item.itemCode}
                    </Td>
                    <Td px={4} py={2} isNumeric>
                      {item.code}
                    </Td>
                    <Td w="full" px={4} py={2}>
                      {item.name}
                    </Td>
                    <Td px={4} py={2} isNumeric>
                      {item.amount.toLocaleString('pt-BR', {
                        maximumFractionDigits: 3,
                        minimumFractionDigits: 3
                      })}
                    </Td>
                    <Td px={4} py={2} isNumeric>
                      {item.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </Td>
                    <Td px={4} py={2} isNumeric>
                      {item.subtotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  order?: Order
  removeOrder: (id: string) => void
}

const DeleteDialog = ({
  isOpen,
  onClose,
  order,
  removeOrder
}: DeleteDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleDelete = async () => {
    if (!order) return

    await api.orders.deleteOrder(order.id)

    removeOrder(order.id)
    onClose()
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Apagar venda</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Realmente deseja apagar a seguinte venda?
            <br />
            <b>
              {order?.code} - {order?.paymentMethod} -{' '}
              {order?.total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </b>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} ml={4} colorScheme="red">
              Apagar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

interface RevertDialogProps {
  isOpen: boolean
  onClose: () => void
  order?: Order
  removeOrder: (id: string) => void
}

const RevertDialog = ({
  isOpen,
  onClose,
  order,
  removeOrder
}: RevertDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleDelete = async () => {
    if (!order) return

    await api.orders.restoreOrder(order.id)

    // removing because it will no longer appear in the list
    removeOrder(order.id)
    onClose()
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Restaurar venda</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Realmente deseja restaurar a seguinte venda?
            <br />
            <b>
              {order?.code} - {order?.paymentMethod} -{' '}
              {order?.total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </b>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} ml={4} colorScheme="green">
              Restaurar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>()
  const [selectedId, setSelectedId] = useState<string>()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const deleteDisclosure = useDisclosure()
  const revertDisclosure = useDisclosure()

  const filtersRef = useRef<Record<string, string>>({})

  const getOrders = async (filters?: GetOrdersParams) => {
    const result = await api.orders.getOrders(filters)

    setOrders(result)
  }

  useEffect(() => {
    getOrders()
  }, [])

  const handleChangeFilter = (key: keyof GetOrdersParams, value: any) => {
    if (value) filtersRef.current[key] = value
    else delete filtersRef.current[key]

    getOrders(filtersRef.current)
  }

  const removeOrder = (id: string) => {
    setOrders((prev) => prev?.filter((order) => order.id !== id))
  }

  return (
    <Flex flexDir="column" gap={4}>
      <OrderModal isOpen={isOpen} onClose={onClose} orderId={selectedId} />

      <DeleteDialog
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.onClose}
        order={orders?.find((order) => order.id === selectedId)}
        removeOrder={removeOrder}
      />

      <RevertDialog
        isOpen={revertDisclosure.isOpen}
        onClose={revertDisclosure.onClose}
        order={orders?.find((order) => order.id === selectedId)}
        removeOrder={removeOrder}
      />

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
        <Flex gap={2} alignItems="center" ml={8}>
          <Switch
            checked={!!filtersRef.current.showDeleted}
            onChange={(e) => {
              handleChangeFilter('showDeleted', e.target.checked)
            }}
          />
          <Text>Vendas excluídas</Text>
        </Flex>
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
            <Th px={4} py={2} />
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
              <Td px={4} py={2} isNumeric>
                <IconButton
                  ml={2}
                  onClick={() => {
                    setSelectedId(order.id)
                    onOpen()
                  }}
                  aria-label="Visualizar venda"
                  colorScheme="blue"
                  size="xs"
                  icon={<FiEye />}
                />

                {order.deletedAt ? (
                  <IconButton
                    ml={2}
                    onClick={() => {
                      setSelectedId(order.id)
                      revertDisclosure.onOpen()
                    }}
                    aria-label="Restaurar venda"
                    colorScheme="green"
                    size="xs"
                    icon={<GrRevert />}
                  />
                ) : (
                  <IconButton
                    ml={2}
                    onClick={() => {
                      setSelectedId(order.id)
                      deleteDisclosure.onOpen()
                    }}
                    aria-label="Apagar venda"
                    colorScheme="red"
                    size="xs"
                    icon={<FiTrash2 />}
                  />
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  )
}

export default Orders
