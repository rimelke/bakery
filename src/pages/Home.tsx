import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
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
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import NumberInput, { NumberInputRef } from '../components/NumberInput'
import api from '../services/api'

interface IOrderItem {
  code: number
  amount: number
  subtotal: number
  product: Product
}

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

const Home = () => {
  const [items, setItems] = useState<IOrderItem[]>([])

  const codeRef = useRef(1)
  const inputRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<NumberInputRef>(null)
  const searchModalRef = useRef<SearchModalRef>(null)
  const productRef = useRef<Product>()

  const focusInput = () => {
    if (!inputRef.current) return

    inputRef.current.focus()
    inputRef.current.select()
  }

  const clearFields = () => {
    if (inputRef.current) inputRef.current.value = ''
    if (amountRef.current) amountRef.current.setValue()
    productRef.current = undefined

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
    if (!amountRef.current || !inputRef.current) return

    const amountRawValue = '1'

    if (product.isFractioned && !amountRawValue) {
      productRef.current = product
      inputRef.current.value = product.name
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

    focusInput()

    if (!rawSearch) return

    const numberSearch = Number(rawSearch)

    const result =
      productRef.current ||
      (await api.products.getProduct(
        isNaN(numberSearch) ? rawSearch : numberSearch
      ))

    if (result instanceof Array) {
      searchModalRef.current?.openModal(rawSearch, result)

      return
    }

    handleAddProduct(result)
  }

  const keyDownHandler: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const focusAmount = () => {
      if (!amountRef.current) return

      amountRef.current.focus()
      // amountRef.current.select()
    }

    const actions: Record<string, () => void> = {
      Enter: handleSubmit,
      '*': focusAmount,
      ArrowDown: focusAmount,
      Escape: clearFields,
      ArrowUp: focusInput,
      F2: () => searchModalRef.current?.openModal('', [])
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
      <SearchModal
        focusInput={focusInput}
        ref={searchModalRef}
        handleAddProduct={handleAddProduct}
      />

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
