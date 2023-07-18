declare namespace Chat {
	import { CHATMODEL } from "@/components/admin/model"

	interface Chat {
	  uuid?: number
	  dateTime: string
	  text: string
	  inversion?: boolean
	  responseCount?: number
	  error?: boolean
	  loading?: boolean
	  conversationOptions?: ConversationRequest | null
	  requestOptions: { prompt: string; options?: ConversationRequest | null }
	  usage?: {
		completion_tokens: number
		prompt_tokens: number
		total_tokens: number
		estimated: boolean
	  }
	}
  
	interface History {
	  title: string
	  isEdit: boolean
	  uuid: number
	  loading?: boolean
	  all?: boolean
	  usingContext: boolean
	  chatModel?: CHATMODEL
	}
  
	interface ChatState {
	  active: number | null
	  usingContext: boolean;
	  history: History[]
	  chat: { uuid: number; data: Chat[] }[]
	  searchKeyword: string
	}
  
	interface ConversationRequest {
	  conversationId?: string
	  parentMessageId?: string
	}
  
	interface ConversationResponse {
	  conversationId: string
	  detail: {
		choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
		created: number
		id: string
		model: string
		object: string
		usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
	  }
	  id: string
	  parentMessageId: string
	  role: string
	  text: string
	}
  }
  