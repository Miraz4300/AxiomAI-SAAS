import { ss } from '@/utils/storage'

const LOCAL_NAME = 'promptStore'

export interface Prompt {
  key: string
  value: string
}

export type PromptList = Prompt[]

export interface PromptStore {
  promptList: PromptList
}

export function getLocalPromptList(): PromptStore {
  const promptStore: PromptStore | undefined = ss.get(LOCAL_NAME)
  return promptStore ?? { promptList: [] }
}

// Add the data to the prompt list if it doesn't exist
const promptData: Prompt[] = [
  {
    key: 'Wikipedia',
    value: 'I want you to act as a Wikipedia. I will give you the name of a topic, and you will provide a summary of that topic in the format of a Wikipedia page. Your summary should be informative and factual, covering the most important aspects of the topic. Start your summary with an introductory paragraph that gives an overview of the topic.',
  },
  {
    key: 'Dictionary',
    value: 'I want you to act as a Dictionary. I will provide one word. You will provide Origin of the word, meaning, parts of speech, Bangla meaning, five similar words, and three example sentences with that word.',
  },
]

const promptStore: PromptStore = getLocalPromptList()

// Check if promptData already exists in promptStore
const existingPromptKeys = promptStore.promptList.map(prompt => prompt.key)
const newPromptData = promptData.filter(prompt => !existingPromptKeys.includes(prompt.key))

// Add new prompts to promptStore
promptStore.promptList.push(...newPromptData)
ss.set(LOCAL_NAME, promptStore)
