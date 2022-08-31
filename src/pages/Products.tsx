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
  Tr,
  useDisclosure,
  Input as ChakraInput
} from '@chakra-ui/react'
import { products as Product } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { Form } from '@unform/web'
import { FormNumberInput, Input } from '../components/form'
import NumberInput from '../components/NumberInput'
import FormSwitch from '../components/form/FormSwitch'
import { CreateProductData } from '../electron/handlers/products'
import * as yup from 'yup'
import validateData from '../utils/validateData'
import { FormHandles } from '@unform/core'
import useDebounce from '../hooks/useDebounce'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  removeProduct: (id: string) => void
}

const DeleteDialog = ({
  isOpen,
  onClose,
  product,
  removeProduct
}: DeleteDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleDelete = async () => {
    if (!product) return

    await api.products.deleteProduct(product.id)

    removeProduct(product.id)
    onClose()
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Apagar produto</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Realmente deseja apagar o seguinte produto?
            <br />
            <b>
              {product?.code} - {product?.name}
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

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Product) => void
}

const ProductModal = ({
  isOpen,
  onClose,
  addProduct,
  product,
  updateProduct
}: AddProductModalProps) => {
  const [price, setPrice] = useState<number>()
  const [cost, setCost] = useState<number>()

  const [isFractioned, setIsFractioned] = useState(false)

  const formRef = useRef<FormHandles>(null)

  useEffect(() => {
    setCost(product?.cost)
    setPrice(product?.price)
    setIsFractioned(product?.isFractioned || false)
  }, [product])

  const profit = cost && price ? price - cost : 0

  const handleSubmit = async (data: CreateProductData) => {
    const value = await validateData(
      data,
      yup.object().shape({
        code: yup.string().trim().required('Código é obrigatório'),
        name: yup.string().trim().required('Nome é obrigatório'),
        cost: yup.number().positive().required('Custo é obrigatório'),
        price: yup
          .number()
          .positive()
          .moreThan(yup.ref('cost'), 'Deve ser maior que o custo')
          .required('Preço é obrigatório'),
        isFractioned: yup.boolean().required('Obrigatório'),
        inventory: yup
          .number()
          .integer()
          .when('isFractioned', {
            is: true,
            then: (schema) => schema,
            otherwise: (schema) => schema.required('Estoque é obrigatório')
          })
      }),
      formRef.current
    )

    if (!value) return

    const codeUsed = await api.products.getProduct(value.code)

    if (!(codeUsed instanceof Array) && codeUsed.id !== product?.id) {
      formRef.current?.setErrors({ code: 'Código já utilizado' })

      return
    }

    const result = product
      ? await api.products.updateProduct(product.id, value)
      : await api.products.createProduct(value)

    setPrice(undefined)
    setCost(undefined)
    if (product) updateProduct(product.id, result)
    else addProduct(result)
    onClose()
  }

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {product ? 'Editar' : 'Adicionar'} produto
          {product && ` - ${product.code} - ${product.name}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Form
            initialData={product}
            noValidate
            ref={formRef}
            onSubmit={handleSubmit}>
            <Flex flexDir="column" gap={4}>
              <Flex gap={2}>
                <Input
                  onChange={(e) =>
                    (e.target.value = e.target.value.replace(/\D/g, ''))
                  }
                  isRequired
                  label="Código"
                  flex={1}
                  name="code"
                />
                <Input isRequired label="Nome" flex={2} name="name" />
              </Flex>
              <Flex gap={2}>
                <Box mr={6} w={40}>
                  <FormNumberInput
                    onValueChange={(value) => setPrice(value)}
                    prefix="R$ "
                    label="Preço"
                    name="price"
                    isRequired
                    w={40}
                  />
                </Box>

                <FormNumberInput
                  value={cost}
                  onValueChange={(value) => setCost(value)}
                  prefix="R$ "
                  label="Custo"
                  name="cost"
                  isRequired
                  w={40}
                />
                <NumberInput
                  value={profit}
                  onValueChange={(value) => {
                    if (!price) return

                    setCost(price - (value || 0))
                  }}
                  prefix="R$ "
                  placeholder="Lucro (R$)"
                />
                <NumberInput
                  value={price ? (profit * 100) / price : 0}
                  onValueChange={(value) => {
                    if (!price) return

                    setCost(price - (price * (value || 0)) / 100)
                  }}
                  suffix=" %"
                  precision={1}
                  placeholder="Lucro (%)"
                />
              </Flex>
              <Flex gap={8}>
                <Flex gap={2} alignItems="center">
                  <Text>Fracionado?</Text>
                  <FormSwitch
                    onChange={(e) => setIsFractioned(e.target.checked)}
                    name="isFractioned"
                  />
                </Flex>

                {!isFractioned && (
                  <Box w={40}>
                    <FormNumberInput
                      allowNegative
                      name="inventory"
                      precision={0}
                      isRequired
                      label="Estoque"
                    />
                  </Box>
                )}
              </Flex>

              <Button alignSelf="flex-end" type="submit" colorScheme="green">
                Salvar
              </Button>
            </Flex>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>()
  const [selectedId, setSelectedId] = useState<string>()
  const {
    isOpen: isDeleteOpen,
    onClose: onDeleteClose,
    onOpen: onDeleteOpen
  } = useDisclosure()
  const { isOpen, onClose, onOpen } = useDisclosure()

  const getProducts = async (search?: string) => {
    const result = await api.products.getProducts(search)

    setProducts(result)
    setSelectedId(undefined)
  }

  const debouncedGetProducts = useDebounce(getProducts)

  useEffect(() => {
    getProducts()
  }, [])

  const removeProduct = (id: string) => {
    setProducts((prevProducts) =>
      prevProducts?.filter((product) => product.id !== id)
    )

    if (selectedId === id) setSelectedId(undefined)
  }

  const addProduct = (product: Product) => {
    setProducts((prevProducts) => prevProducts && [product, ...prevProducts])
  }

  const updateProduct = (id: string, product: Product) => {
    setProducts((prevProducts) => {
      if (!prevProducts) return

      const index = prevProducts.findIndex(
        (prevProduct) => prevProduct.id === id
      )

      if (index > -1) prevProducts[index] = product

      return [...prevProducts]
    })
  }

  const selectedProduct = products?.find((product) => product.id === selectedId)

  return (
    <Flex flexDir="column" gap={4}>
      <DeleteDialog
        removeProduct={removeProduct}
        product={selectedProduct}
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />

      <ProductModal
        product={selectedProduct}
        addProduct={addProduct}
        isOpen={isOpen}
        updateProduct={updateProduct}
        onClose={onClose}
      />

      <Flex gap={4}>
        <Button
          onClick={() => {
            setSelectedId(undefined)
            onOpen()
          }}
          colorScheme="green">
          Adicionar
        </Button>

        <ChakraInput
          bg="white"
          w={60}
          onChange={(e) => debouncedGetProducts(e.target.value)}
          placeholder="Pesquise por algo"
        />
      </Flex>

      <Table bg="white" borderRadius="md" overflow="hidden">
        <Thead bg="gray.100">
          <Tr>
            <Th px={4} py={2} isNumeric>
              Cód.
            </Th>
            <Th px={4} py={2}>
              Nome
            </Th>
            <Th px={4} py={2} isNumeric>
              Preço
            </Th>
            <Th px={4} py={2}>
              Fracionado
            </Th>
            <Th px={4} py={2} />
          </Tr>
        </Thead>
        <Tbody>
          {products?.map((product) => (
            <Tr _hover={{ bg: 'cyan.100' }} key={product.id}>
              <Td px={4} py={2} isNumeric>
                {product.code}
              </Td>
              <Td px={4} py={2}>
                {product.name}
              </Td>
              <Td px={4} py={2} isNumeric>
                {product.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </Td>
              <Td px={4} py={2}>
                {product.isFractioned ? 'SIM' : 'NÃO'}
              </Td>
              <Td px={4} py={2} isNumeric>
                <IconButton
                  onClick={() => {
                    setSelectedId(product.id)
                    onOpen()
                  }}
                  aria-label="Editar produto"
                  colorScheme="orange"
                  size="xs"
                  icon={<FiEdit />}
                />
                <IconButton
                  ml={2}
                  onClick={() => {
                    setSelectedId(product.id)
                    onDeleteOpen()
                  }}
                  aria-label="Apagar produto"
                  colorScheme="red"
                  size="xs"
                  icon={<FiTrash2 />}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  )
}

export default Products
