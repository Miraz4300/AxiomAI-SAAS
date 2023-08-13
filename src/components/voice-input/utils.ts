/**
 * @create 2023-08-13
 * @desc utils
 */
import type { Ref } from 'vue'

interface replaceMapItem {
  symbol: string
  enSymbol: string
  terms: string[]
}
export enum commandType {
  clear = 'clear',
  deleteLast = 'deleteLast',
  reset = 'reset',
  submit = 'submit',
  stop = 'stop',
  switchLang = 'switchLang',
}

const replaceMap: replaceMapItem[] = [
  { symbol: ',', enSymbol: ',', terms: ['comma', 'কমা'] },
  { symbol: '.', enSymbol: '.', terms: ['full stop', 'দাড়ি'] },
  { symbol: '?', enSymbol: '?', terms: ['question mark', 'প্রশ্নবোধক'] },
  { symbol: ':', enSymbol: ':', terms: ['colon', 'কোলন'] },
  { symbol: '!', enSymbol: '!', terms: ['exclamatory mark', 'বিস্ময়সূচক চিহ্ন'] },
  { symbol: '\r\n', enSymbol: '\r\n', terms: ['newline', 'নতুন লাইন'] },
  { symbol: '.', enSymbol: '.', terms: ['dot', 'বিন্দু'] },
  { symbol: ' ', enSymbol: ' ', terms: ['space', 'ব্যবধান'] },
]

const langMap: Record<string, string[]> = {
  'en-US': ['switch english', 'switch to english', 'ইংরেজীতে পরিবর্তন', 'ইংরেজীতে স্যুইচ'],
  'bn-BD': ['switch bangla', 'switch to bangla', 'বাংলায় পরিবর্তন', 'বাংলায় স্যুইচ'],
}

const sentenceFlag = ['\r\n', '.', '。', '!', '！', '?', '？']
const commandTermMap: Record<commandType, string[]> = {
  [commandType.clear]: ['clear', 'clean'],
  [commandType.deleteLast]: ['delete', 'revert'],
  [commandType.reset]: ['reset'],
  [commandType.submit]: ['run', 'go', 'start', 'send'],
  [commandType.stop]: ['stop'],
  [commandType.switchLang]: Object.keys(langMap).map(key => langMap[key]).flat(),
}

export function replaceSymbol(str: string, en = false) {
  let resStr = str
  replaceMap.forEach((item) => {
    const fuhao = en ? item.enSymbol : item.symbol

    item.terms.forEach((term) => {
      const regex = new RegExp(`${term}`, 'ig')
      resStr = resStr.replace(regex, fuhao)
    })
  })

  return resStr
}

function repalceFn(str: string, terms: string[], replaceStr = '') {
  for (const term of terms) {
    const regex = new RegExp(`${term}`, 'ig')

    if (regex.test(str)) {
      return {
        hasKey: true,
        str: str.replace(regex, replaceStr),
      }
    }
  }

  return {
    hasKey: false,
    str,
  }
}

// 1. Find the operation corresponding to the voice
// 2. Remove keywords without outputting
export function getCmdKey(str: string) {
  for (const item in commandTermMap) {
    const res = repalceFn(str, commandTermMap[item as unknown as commandType], '')
    if (res.hasKey) {
      return {
        ...res,
        cmdKey: item as unknown as commandType,
      }
    }
  }
}

type CommandFunType = (options: {
  str: string
  sentences: Ref<string[]>
  callback?: (type: commandType, data: string[]) => void
}) => void

function findLastIndex<T>(arr: T[], callback: (item: T, index: number) => boolean) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (callback(arr[i], i))
      return i
  }

  return -1
}
export const deleteLast: CommandFunType = ({ sentences, callback }) => {
  if (!sentences?.value)
    return

  // First delete the value of this sentence is empty
  sentences.value[sentences.value.length - 1] = ''

  // Find an index that is not empty from the back to the front
  const deleteIndex = findLastIndex<string>(sentences.value, item => item !== '')
  if (deleteIndex !== -1) {
    const lastSentences = sentences.value[deleteIndex]
    let flagLastIndex = -1
    sentenceFlag.forEach((flag) => {
      if (flagLastIndex === -1 && lastSentences.lastIndexOf(flag))
        flagLastIndex = lastSentences.lastIndexOf(flag)
    })

    if (flagLastIndex !== -1)
      sentences.value[deleteIndex] = lastSentences.substring(0, flagLastIndex)
    else
      sentences.value[deleteIndex] = ''
  }

  callback?.(commandType.deleteLast, sentences.value)
}

export function getLanguage(str = '') {
  for (const lang in langMap) {
    const token = langMap[lang]
    const hasLang = token?.some(item => str.includes(item))

    if (hasLang)
      return lang
  }
}

export function emptySentences(arr: Ref<string[]>) {
  arr.value = Array(arr.value.length).fill('')
}
export function logger(...msg: string[]) {
  // eslint-disable-next-line no-console
  console.log('*** speech', ...msg)
}

export const tips = [
  { label: 'Delete', value: 'When you say "delete", "revart" etc. the most recent sentence will be deleted' },
  { label: 'Clear', value: 'When you say "clear", "clean" the entire input box will be cleared' },
  { label: 'Reset', value: 'When you say "reset" etc. it will clear the current conversation' },
  { label: 'Send', value: 'When you say "send" etc. the content of the input box will be sent' },
  { label: 'Stop', value: 'When you say "stop" etc. the latest sentence will be deleted' },
  { label: 'Mark', value: 'When you say "comma", "question mark", "carriage return", "space", "exclamation mark", "period" and other commands, punctuation marks will be used instead of text output' },
  { label: 'Lang', value: 'Support switching input language mode. Currently supports: "switch English", "switch Bangla". [Bangla is in beta mode]' },
]
