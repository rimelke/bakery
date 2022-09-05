import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure
} from '@chakra-ui/react'
import { createContext, PropsWithChildren, useEffect, useRef } from 'react'
import useDebounce from '../hooks/useDebounce'

const NotesContext = createContext({})

export const NotesProvider = ({ children }: PropsWithChildren<{}>) => {
  const dataRef = useRef(window.getNotes())
  const disclosure = useDisclosure()

  const debouncedSaveNotes = useDebounce(window.saveNotes, 10 * 1000)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Home') {
      e.preventDefault()
      disclosure.onOpen()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <NotesContext.Provider value={{}}>
      {children}
      <Modal size="5xl" isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Anotações</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              defaultValue={dataRef.current}
              autoFocus
              resize="none"
              minH="70vh"
              onInput={(e) => {
                e.currentTarget.style.height = '1px'
                e.currentTarget.style.height = `${
                  e.currentTarget.scrollHeight +
                  e.currentTarget.offsetHeight -
                  e.currentTarget.clientHeight
                }px`
              }}
              onChange={(e) => {
                dataRef.current = e.target.value
                debouncedSaveNotes(e.target.value)
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </NotesContext.Provider>
  )
}
