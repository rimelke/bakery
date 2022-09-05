import { Flex, IconButton, Text } from '@chakra-ui/react'
import { FiFolder } from 'react-icons/fi'
import { useBackup } from '../contexts/BackupContext'

const Settings = () => {
  const { backupPath, setBackupPath } = useBackup()

  const handleOpenDialog = () => {
    const newPath = window.dialog.getBackupPath()

    if (!newPath) return

    setBackupPath(newPath)
  }

  return (
    <Flex flexDir="column" alignItems="flex-start" gap={2}>
      <Text fontWeight={600}>Arquivo de backup:</Text>
      <Flex alignItems="center" gap={2}>
        <Text px={2} py={1} borderRadius="md" bg="white">
          {backupPath || 'Local de backup não específicado'}
        </Text>
        <IconButton
          onClick={handleOpenDialog}
          aria-label="Salvar backup"
          colorScheme="teal"
          size="sm"
          icon={<FiFolder />}
        />
      </Flex>
    </Flex>
  )
}

export default Settings
