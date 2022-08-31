import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'
import { products as Product } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { FiTrash2 } from 'react-icons/fi'

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>()
  const [selectedId, setSelectedId] = useState<string>()
  const {
    isOpen: isDeleteOpen,
    onClose: onDeleteClose,
    onOpen: onDeleteOpen
  } = useDisclosure()

  useEffect(() => {
    const getProducts = async () => {
      const result = await api.products.getProducts()

      setProducts(result)
      setSelectedId(undefined)
    }

    getProducts()
  }, [])

  const removeProduct = (id: string) => {
    setProducts((prevProducts) =>
      prevProducts?.filter((product) => product.id !== id)
    )

    if (selectedId === id) setSelectedId(undefined)
  }

  const selectedProduct = products?.find((product) => product.id === selectedId)

  return (
    <Flex flexDir="column">
      <DeleteDialog
        removeProduct={removeProduct}
        product={selectedProduct}
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />

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
