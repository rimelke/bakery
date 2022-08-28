import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import { products as Product } from '@prisma/client'
import {
  forwardRef,
  ForwardRefRenderFunction,
  KeyboardEventHandler,
  RefObject,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import NumberFormat from 'react-number-format'
import api from '../services/api'

interface IOrderItem {
  code: number
  amount: number
  subtotal: number
  product: Product
}

interface NumberInputProps extends InputProps {
  precision?: number
}

const NumberInputWithRef: ForwardRefRenderFunction<any, NumberInputProps> = (
  { precision = 2, onKeyDown = () => {}, ...props },
  ref
) => (
  <NumberFormat
    customInput={(customProps: any) => (
      <Input
        {...props}
        ref={ref}
        {...customProps}
        onKeyDown={(e) => {
          customProps.onKeyDown(e)
          onKeyDown(e)
        }}
      />
    )}
    decimalScale={precision}
    decimalSeparator=","
    fixedDecimalScale
    autoComplete="off"
  />
)

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  NumberInputWithRef
)

interface SearchModalRef {
  openModal: (products: Product[]) => void
}

interface SearchModalProps {
  inputRef: RefObject<HTMLInputElement>
}

const SearchModalWithRef: ForwardRefRenderFunction<
  SearchModalRef,
  SearchModalProps
> = ({ inputRef }, ref) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchProducts, setSearchProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<string>()

  const selectedRowRef = useRef<HTMLTableRowElement>(null)

  const handleSearchClose = () => {
    setIsSearchOpen(false)
  }

  const openModal = (products: Product[]) => {
    setSearchProducts(products)
    setSelectedId(products[0]?.id)
    setIsSearchOpen(true)
    selectedRowRef.current?.focus()
  }

  useImperativeHandle(
    ref,
    () => ({
      openModal
    }),
    []
  )

  return (
    <Modal
      finalFocusRef={inputRef}
      isOpen={isSearchOpen}
      onClose={handleSearchClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Busca de produtos</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
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
                    ref={selectedId === product.id ? selectedRowRef : undefined}
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

const Home = () => {
  const [items, setItems] = useState<IOrderItem[]>([])

  const codeRef = useRef(1)
  const inputRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const searchModalRef = useRef<SearchModalRef>(null)

  const focusInput = () => {
    if (!inputRef.current) return

    inputRef.current.focus()
  }

  const clearFields = () => {
    if (inputRef.current) inputRef.current.value = ''
    if (amountRef.current) amountRef.current.value = ''

    focusInput()
  }

  const addProduct = (product: Product, amount: number) => {
    const newItem: IOrderItem = {
      product,
      code: codeRef.current++,
      amount,
      subtotal: Math.round(product.price * amount * 100) / 100
    }

    clearFields()

    setItems((prevItems) => [...prevItems, newItem])
  }

  const handleAddProduct = (product: Product) => {
    if (!amountRef.current) return

    const amountRawValue = amountRef.current.value

    if (product.isFractioned && !amountRawValue) {
      amountRef.current.focus()

      return
    }

    addProduct(
      product,
      amountRawValue ? Number(amountRawValue.replace(',', '.')) : 1
    )
  }

  const handleSubmit = async () => {
    if (!inputRef.current) return

    const rawSearch = inputRef.current.value

    if (!rawSearch) {
      focusInput()

      return
    }

    const numberSearch = Number(rawSearch)

    const result = await api.products.getProduct(
      isNaN(numberSearch) ? rawSearch : numberSearch
    )

    if (result instanceof Array) {
      searchModalRef.current?.openModal(result)

      return
    }

    handleAddProduct(result)
  }

  const keyDownHandler: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const focusAmount = () => {
      if (!amountRef.current) return

      amountRef.current.focus()
      amountRef.current.select()
    }

    const actions: Record<string, () => void> = {
      Enter: handleSubmit,
      '*': focusAmount,
      ArrowDown: focusAmount,
      Escape: clearFields,
      ArrowUp: focusInput,
      F2: () => searchModalRef.current?.openModal([])
    }

    if (!actions[e.key]) {
      console.log(e.key)
      return
    }

    e.preventDefault()
    actions[e.key]()
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0)

  return (
    <Flex bg="gray.200" h="100vh" justifyContent="space-between" gap={8} p={8}>
      <SearchModal ref={searchModalRef} inputRef={inputRef} />

      <Flex flexDir="column" flex={1}>
        <Table bg="white" borderRadius="md" overflow="hidden">
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
              <Tr key={item.code}>
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
      <Flex flexDir="column" justifyContent="space-between" gap={16}>
        <Flex flexDir="column" gap={4}>
          <FormControl>
            <FormLabel>Produto</FormLabel>
            <Input
              ref={inputRef}
              bg="white"
              textAlign="end"
              onFocus={() => inputRef.current?.select()}
              autoFocus
              onKeyDown={keyDownHandler}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Quantidade</FormLabel>
            <NumberInput
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
      </Flex>
    </Flex>
  )
}

export default Home
