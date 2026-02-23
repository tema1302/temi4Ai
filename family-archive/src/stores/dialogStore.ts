import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DialogType = 'alert' | 'confirm' | 'prompt'

interface DialogState {
  isOpen: boolean
  type: DialogType
  title: string
  message: string
  confirmText: string
  cancelText: string
  placeholder: string
  inputValue: string
  resolve: (value: any) => void
}

export const useDialogStore = defineStore('dialog', () => {
  const state = ref<DialogState>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    confirmText: 'ОК',
    cancelText: 'Отмена',
    placeholder: '',
    inputValue: '',
    resolve: () => {}
  })

  function show(options: Partial<Omit<DialogState, 'isOpen' | 'resolve'>> & { type: DialogType }): Promise<any> {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        type: options.type,
        title: options.title || (options.type === 'alert' ? 'Уведомление' : options.type === 'confirm' ? 'Подтверждение' : 'Ввод данных'),
        message: options.message || '',
        confirmText: options.confirmText || 'ОК',
        cancelText: options.cancelText || 'Отмена',
        placeholder: options.placeholder || '',
        inputValue: options.inputValue || '',
        resolve
      }
    })
  }

  function alert(message: string, title?: string): Promise<void> {
    return show({ type: 'alert', message, title })
  }

  function confirm(message: string, title?: string): Promise<boolean> {
    return show({ type: 'confirm', message, title })
  }

  function prompt(message: string, defaultValue: string = '', placeholder: string = ''): Promise<string | null> {
    return show({ type: 'prompt', message, inputValue: defaultValue, placeholder })
  }

  function close(value: any) {
    state.value.isOpen = false
    state.value.resolve(value)
  }

  return {
    state,
    alert,
    confirm,
    prompt,
    close
  }
})
