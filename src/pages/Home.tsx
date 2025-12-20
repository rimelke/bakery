import {
  forwardRef,
  ForwardRefRenderFunction,
  KeyboardEventHandler,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { BsCashCoin } from 'react-icons/bs'
import { FiCreditCard } from 'react-icons/fi'

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
  FormControl,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import { IconPix } from '../components/custom-icons'
import NumberInput, { NumberInputRef } from '../components/NumberInput'
import { PaymentMethod } from '../constants/paymentMethods'
import api from '../services/api'
import BasicOrderItem from '../types/BasicOrderItem'
import { Product } from '../types/product'

interface SearchModalRef {
  openModal: (search: string, products: Product[]) => void
}

interface SearchModalProps {
  handleAddProduct: (product: Product) => void
  focusInput: () => void
}

const SearchModalWithRef: ForwardRefRenderFunction<
  SearchModalRef,
  SearchModalProps
> = ({ handleAddProduct, focusInput }, ref) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchProducts, setSearchProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<string>()

  const searchRef = useRef<HTMLInputElement>(null)
  const usedSearchRef = useRef('')

  const handleSearchClose = () => {
    setIsSearchOpen(false)
    focusInput()
  }

  const handleNewSearch = (search: string, products: Product[]) => {
    usedSearchRef.current = search

    setSearchProducts(products)
    setSelectedId(products[0]?.id)
  }

  const openModal = (search: string, products: Product[]) => {
    handleNewSearch(search, products)
    setIsSearchOpen(true)
  }

  useImperativeHandle(
    ref,
    () => ({
      openModal
    }),
    []
  )

  const selectedProductIndex = searchProducts.findIndex(
    (product) => product.id === selectedId
  )

  const handleSubmit = async () => {
    const newSearch = searchRef.current?.value || ''

    if (newSearch === usedSearchRef.current) {
      if (selectedProductIndex > -1) {
        handleSearchClose()
        handleAddProduct(searchProducts[selectedProductIndex])
      }

      return
    }

    const result = await api.products.getProduct(newSearch)
    handleNewSearch(newSearch, result instanceof Array ? result : [result])
  }

  const selectProduct = (offset: number) => {
    const newSelectedProduct = searchProducts[selectedProductIndex + offset]

    if (!newSelectedProduct) return

    setSelectedId(newSelectedProduct.id)
  }

  const keyDownHandler: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const actions: Record<string, () => void> = {
      Enter: handleSubmit,
      ArrowDown: () => selectProduct(1),
      ArrowUp: () => selectProduct(-1)
    }

    if (!actions[e.key]) return

    e.preventDefault()
    actions[e.key]()
  }

  return (
    <Modal
      returnFocusOnClose={false}
      trapFocus={false}
      size="3xl"
      isOpen={isSearchOpen}
      onClose={handleSearchClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Busca de produtos</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Input
            autoFocus
            onFocus={() => searchRef.current?.select()}
            defaultValue={usedSearchRef.current}
            onKeyDown={keyDownHandler}
            ref={searchRef}
          />
          <Box
            mt={4}
            borderWidth="2px"
            borderColor="gray.100"
            borderRadius="md"
            overflow="hidden">
            <Table>
              <Thead bg="gray.100">
                <Tr>
                  <Th isNumeric>Cód.</Th>
                  <Th>Nome</Th>
                  <Th isNumeric>Preço</Th>
                </Tr>
              </Thead>
              <Tbody>
                {searchProducts.map((product) => (
                  <Tr
                    bg={selectedId === product.id ? 'cyan.100' : undefined}
                    key={product.id}>
                    <Td isNumeric>{product.code}</Td>
                    <Td>{product.name}</Td>
                    <Td isNumeric>
                      {product.price.toLocaleString('pt-BR', {
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

const SearchModal = forwardRef<SearchModalRef, SearchModalProps>(
  SearchModalWithRef
)

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  focusTable: (useSelectedIndex?: boolean) => void
  focusInput: () => void
  item?: BasicOrderItem
  deleteItem: (code: string) => void
}

const DeleteDialog = ({
  isOpen,
  onClose,
  deleteItem,
  item,
  focusInput,
  focusTable
}: DeleteDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)

  const handleCancel = () => {
    onClose()
    focusTable(true)
  }

  if (!item) return <></>

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      trapFocus={false}
      returnFocusOnClose
      isOpen={isOpen}
      onClose={handleCancel}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Apagar item</AlertDialogHeader>
          <AlertDialogBody>
            Realmente deseja apagar o seguinte item?
            <br />
            <b>
              {item.code} - {item.product.name}
            </b>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              autoFocus
              onKeyDown={(e) =>
                e.key === 'ArrowRight' && deleteRef.current?.focus()
              }
              tabIndex={0}
              ref={cancelRef}
              onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onKeyDown={(e) =>
                e.key === 'ArrowLeft' && cancelRef.current?.focus()
              }
              tabIndex={1}
              ref={deleteRef}
              colorScheme="red"
              onClick={() => {
                deleteItem(item.code)
                onClose()
                focusInput()
              }}
              ml={3}>
              Apagar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

interface CloseOrderModalProps {
  total: number
  items: BasicOrderItem[]
  focusInput: () => void
  resetOrder: () => void
}
interface CloseOrderModalRef {
  open: (method: PaymentMethod) => void
}

const CloseOrderModalWithRef: ForwardRefRenderFunction<
  CloseOrderModalRef,
  CloseOrderModalProps
> = ({ total, focusInput, items, resetOrder }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CARTÃO')
  const [paymentTotal, setPaymentTotal] = useState<number>()

  useEffect(() => {
    setPaymentTotal(total)
  }, [total])

  useImperativeHandle(
    ref,
    () => ({
      open: (method) => {
        setSelectedMethod(method)
        setIsOpen(true)
      }
    }),
    []
  )

  const paymentOver =
    paymentTotal && paymentTotal > total ? paymentTotal - total : 0

  const onClose = () => {
    setIsOpen(false)
    focusInput()
  }

  const handleSubmit = async () => {
    await api.orders.createOrder({
      items,
      paymentMethod: selectedMethod,
      paymentTotal: selectedMethod === 'DINHEIRO' ? paymentTotal : undefined
    })

    onClose()
    resetOrder()
  }

  return (
    <Modal
      trapFocus={false}
      returnFocusOnClose={false}
      isOpen={isOpen}
      onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Fechar venda - {selectedMethod}</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDir="column" gap={4}>
          <Flex fontSize="lg" justifyContent="flex-end" gap={8}>
            <Text>Total</Text>
            <Text>
              {total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Text>
          </Flex>

          {selectedMethod === 'DINHEIRO' && (
            <>
              <Flex alignItems="center" gap={8} justifyContent="flex-end">
                <Text fontSize="lg">Pago</Text>
                <NumberInput
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  defaultValue={total}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onValueChange={(value) => setPaymentTotal(value)}
                  prefix="R$ "
                  w={32}
                  textAlign="end"
                />
              </Flex>
              <Flex
                fontSize="lg"
                fontWeight="bold"
                justifyContent="flex-end"
                gap={8}>
                <Text>Troco</Text>
                <Text>
                  {paymentOver.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Text>
              </Flex>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSubmit}
            autoFocus={selectedMethod !== 'DINHEIRO'}
            colorScheme="green">
            Finalizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const CloseOrderModal = forwardRef(CloseOrderModalWithRef)

interface ResetDialogProps {
  isOpen: boolean
  onClose: () => void
  resetOrder: () => void
}

const ResetDialog = ({ isOpen, onClose, resetOrder }: ResetDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}>
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>Cancelar venda?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogFooter>
          <Button
            onKeyDown={(e) =>
              e.key === 'ArrowRight' && submitRef.current?.focus()
            }
            tabIndex={0}
            ref={cancelRef}
            onClick={onClose}>
            Não
          </Button>
          <Button
            onKeyDown={(e) =>
              e.key === 'ArrowLeft' && cancelRef.current?.focus()
            }
            tabIndex={1}
            ref={submitRef}
            colorScheme="red"
            onClick={resetOrder}
            ml={3}>
            Sim
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const Home = () => {
  const [items, setItems] = useState<BasicOrderItem[]>([])
  const [selectedCode, setSelectedCode] = useState<string>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const codeRef = useRef(1)
  const inputRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<NumberInputRef>(null)
  const searchModalRef = useRef<SearchModalRef>(null)
  const productRef = useRef<Product>()
  const tableRef = useRef<HTMLTableElement>(null)
  const closeOrderModalRef = useRef<CloseOrderModalRef>(null)
  const resetOrderDisclosure = useDisclosure()

  const focusInput = () => {
    if (!inputRef.current) return

    inputRef.current.focus()
    inputRef.current.select()
  }

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        focusInput()
      }
    }

    window.addEventListener('keydown', onEscape)

    return () => {
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  const clearFields = () => {
    if (inputRef.current) inputRef.current.value = ''
    if (amountRef.current) amountRef.current.setValue()
    productRef.current = undefined

    setSelectedCode(undefined)
    focusInput()
  }

  const addProduct = (product: Product, amount: number) => {
    const newItem: BasicOrderItem = {
      product,
      code: `${codeRef.current++}`,
      amount,
      subtotal: Math.round(product.price * amount * 100) / 100
    }

    clearFields()

    setItems((prevItems) => [...prevItems, newItem])
  }

  const handleAddProduct = (product: Product) => {
    if (!amountRef.current || !inputRef.current) return

    let amountRawValue = amountRef.current.getValue()

    if (product.isFractioned && !amountRawValue) {
      productRef.current = product
      inputRef.current.value = product.name
      amountRef.current.focus()

      return
    }

    if (!product.isFractioned) {
      amountRawValue = Math.round(amountRawValue || 1)
    }

    addProduct(product, amountRawValue || 1)
  }

  const handleSubmit = async () => {
    if (!inputRef.current) return

    const rawSearch = inputRef.current.value

    focusInput()

    if (!rawSearch) return

    const result =
      productRef.current || (await api.products.getProduct(rawSearch))

    if (result instanceof Array) {
      searchModalRef.current?.openModal(rawSearch, result)

      return
    }

    handleAddProduct(result)
  }

  const selectedItemIndex =
    selectedCode && items.findIndex((item) => item.code === selectedCode)
  const selectedItem =
    typeof selectedItemIndex === 'number' ? items[selectedItemIndex] : undefined

  const focusTable = (useSelectedIndex = false) => {
    const usedIndex = (useSelectedIndex && selectedItemIndex) || 0

    if (!tableRef.current || items.length <= usedIndex) return

    setSelectedCode(items[usedIndex].code)
    tableRef.current.focus()
  }

  const focusAmount = () => {
    if (!amountRef.current) return

    amountRef.current.focus()
    amountRef.current.select()
  }

  const focusNext = () => {
    if (inputRef.current === document.activeElement) {
      focusAmount()
    } else {
      focusInput()
    }
  }

  const keyDownHandler: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const actions: Record<string, () => void> = {
      Enter: handleSubmit,
      '*': focusAmount,
      ArrowDown: focusAmount,
      Escape: clearFields,
      ArrowUp: focusInput,
      ArrowLeft: focusTable,
      F2: () => searchModalRef.current?.openModal('', []),
      F5: focusTable,
      Delete: focusTable,
      Tab: focusNext,
      F9: () => closeOrderModalRef.current?.open('CARTÃO'),
      F10: () => closeOrderModalRef.current?.open('DINHEIRO'),
      F11: () => closeOrderModalRef.current?.open('PIX'),
      F6: () => codeRef.current > 1 && resetOrderDisclosure.onOpen()
    }

    if (!actions[e.key]) {
      return
    }

    e.preventDefault()
    actions[e.key]()
  }

  const selectItem = (offset: number) => {
    if (typeof selectedItemIndex !== 'number') return

    const newSelectedItem = items[selectedItemIndex + offset]

    if (!newSelectedItem) return

    setSelectedCode(newSelectedItem.code)
  }

  const tableKeyDownHandler: KeyboardEventHandler<HTMLTableElement> = (e) => {
    const openDelete = () => {
      setIsDeleteOpen(true)
    }

    const actions: Record<string, () => void> = {
      Enter: openDelete,
      Delete: openDelete,
      Escape: clearFields,
      ArrowRight: clearFields,
      F5: clearFields,
      ArrowDown: () => selectItem(1),
      ArrowUp: () => selectItem(-1)
    }

    if (!actions[e.key]) return

    e.preventDefault()
    actions[e.key]()
  }

  const deleteItem = (code: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.code !== code))
  }

  const resetOrder = () => {
    codeRef.current = 1
    setItems([])
    clearFields()
    setIsDeleteOpen(false)
    resetOrderDisclosure.onClose()
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0)

  return (
    <Flex alignItems="flex-start" justifyContent="space-between" gap={8}>
      <SearchModal
        focusInput={focusInput}
        ref={searchModalRef}
        handleAddProduct={handleAddProduct}
      />

      <DeleteDialog
        deleteItem={deleteItem}
        item={selectedItem}
        focusTable={focusTable}
        focusInput={focusInput}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />

      {items.length > 0 && (
        <>
          <CloseOrderModal
            resetOrder={resetOrder}
            items={items}
            focusInput={focusInput}
            total={total}
            ref={closeOrderModalRef}
          />

          <ResetDialog
            isOpen={resetOrderDisclosure.isOpen}
            onClose={resetOrderDisclosure.onClose}
            resetOrder={resetOrder}
          />
        </>
      )}

      <Flex flexDir="column" flex={1}>
        <Table
          onKeyDown={tableKeyDownHandler}
          tabIndex={0}
          ref={tableRef}
          outline="none"
          bg="white"
          borderRadius="md"
          overflow="hidden">
          <Thead bg="gray.100">
            <Tr>
              <Th px={4} py={2} isNumeric>
                #
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
            {items.map((item) => (
              <Tr
                key={item.code}
                bg={selectedCode === item.code ? 'cyan.100' : undefined}>
                <Td px={4} py={2} isNumeric>
                  {item.code}
                </Td>
                <Td w="full" px={4} py={2}>
                  {item.product.name}
                </Td>
                <Td px={4} py={2} isNumeric>
                  {item.amount.toLocaleString('pt-BR', {
                    maximumFractionDigits: 3,
                    minimumFractionDigits: 3
                  })}
                </Td>
                <Td px={4} py={2} isNumeric>
                  {item.product.price.toLocaleString('pt-BR', {
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
      </Flex>
      <Flex
        flexDir="column"
        justifyContent="space-between"
        gap={10}
        pos="sticky"
        top={4}>
        <Flex flexDir="column" gap={4}>
          <FormControl>
            <FormLabel>Produto</FormLabel>
            <Input
              onClick={focusInput}
              ref={inputRef}
              bg="white"
              textAlign="end"
              autoFocus
              onKeyDown={keyDownHandler}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Quantidade</FormLabel>
            <NumberInput
              onClick={focusAmount}
              placeholder="1,000"
              precision={3}
              textAlign="end"
              ref={amountRef}
              bg="white"
              onKeyDown={keyDownHandler}
            />
          </FormControl>
        </Flex>
        <Flex flexDir="column" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">
            Total
          </Text>
          <Text
            bg="white"
            fontSize="2xl"
            fontWeight="bold"
            py={2}
            px={4}
            textAlign="end"
            borderRadius="md">
            {total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </Text>
        </Flex>
        {items.length > 0 && (
          <Flex flexDir="column" gap={4}>
            <Text>Fechar venda com:</Text>
            <SimpleGrid columns={2} gap={4}>
              <Button
                py={6}
                display="flex"
                alignItems="center"
                gap={1}
                onClick={() => closeOrderModalRef.current?.open('PIX')}>
                <Icon as={IconPix} />
                <Text>Pix</Text>
              </Button>
              <Button
                py={6}
                display="flex"
                alignItems="center"
                gap={1.5}
                onClick={() => closeOrderModalRef.current?.open('CARTÃO')}>
                <Icon as={FiCreditCard} />
                <Text>Cartão</Text>
              </Button>
              <Button
                py={6}
                display="flex"
                alignItems="center"
                gap={1.5}
                onClick={() => closeOrderModalRef.current?.open('DINHEIRO')}>
                <Icon as={BsCashCoin} />
                <Text>Dinheiro</Text>
              </Button>
            </SimpleGrid>
          </Flex>
        )}

        <Flex flexDir="column" gap={1}>
          <Text>Atalhos:</Text>
          <Text fontWeight="bold">F1 / Home - Anotações</Text>
          <Text fontWeight="bold">F2 - Buscar produto</Text>
          <Text fontWeight="bold">F5 - Apagar produto</Text>
          <Text fontWeight="bold">F6 - Cancelar venda</Text>
          <Text fontWeight="bold">F9 - Fechar venda (Cartão)</Text>
          <Text fontWeight="bold">F10 - Fechar venda (Dinheiro)</Text>
          <Text fontWeight="bold">F11 - Fechar venda (Pix)</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Home
