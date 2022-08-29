import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
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
  item?: IOrderItem
  deleteItem: (code: number) => void
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
          <AlertDialogBody>Fon</AlertDialogBody>
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

const Home = () => {
  const [items, setItems] = useState<IOrderItem[]>([])
  const [selectedCode, setSelectedCode] = useState<number>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const codeRef = useRef(1)
  const inputRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<NumberInputRef>(null)
  const searchModalRef = useRef<SearchModalRef>(null)
  const productRef = useRef<Product>()
  const tableRef = useRef<HTMLTableElement>(null)

  const focusInput = () => {
    if (!inputRef.current) return

    inputRef.current.focus()
    inputRef.current.select()
  }

  const clearFields = () => {
    if (inputRef.current) inputRef.current.value = ''
    if (amountRef.current) amountRef.current.setValue()
    productRef.current = undefined

    setSelectedCode(undefined)
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

    const amountRawValue = amountRef.current.getValue()

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

  const selectedItemIndex =
    selectedCode && items.findIndex((item) => item.code === selectedCode)
  const selectedItem = selectedItemIndex ? items[selectedItemIndex] : undefined

  const focusTable = (useSelectedIndex = false) => {
    const usedIndex = (useSelectedIndex && selectedItemIndex) || 0

    if (!tableRef.current || items.length <= usedIndex) return

    setSelectedCode(items[usedIndex].code)
    tableRef.current.focus()
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
      ArrowLeft: focusTable,
      F2: () => searchModalRef.current?.openModal('', []),
      F5: focusTable,
      Delete: focusTable,
      Tab: () => {}
    }

    if (!actions[e.key]) {
      console.log(e.key)
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

  const deleteItem = (code: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.code !== code))
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0)

  return (
    <Flex bg="gray.200" h="100vh" justifyContent="space-between" gap={8} p={8}>
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
      <Flex flexDir="column" justifyContent="space-between" gap={16}>
        <Flex flexDir="column" gap={4}>
          <FormControl>
            <FormLabel>Produto</FormLabel>
            <Input
              onClick={clearFields}
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
              onClick={clearFields}
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
