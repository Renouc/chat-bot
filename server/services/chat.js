import { getWeather } from '../utils/wetherHandler.js'

const messages = [
  {
    role: 'system',
    content:
      '你是一个中文智能助手，请使用中文回答用户的问题。你的回答较为幽默诙谐，知识专业的同时，夹杂一些emoji表情。',
  },
]

const tools = [
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: '获取指定城市和日期的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称，如：北京、上海、广州',
          },
          date: {
            type: 'string',
            description: '日期，只能是：今天、明天、后天',
          },
        },
        required: ['city', 'date'],
      },
    },
  },
]

export async function chatHandler(req, res) {
  const message = req.query.message
  console.log('message:', message)

  messages.push({ role: 'user', content: message })

  // 第一次请求 LLM
  const response = await fetchChat(messages, tools)
  const data = await response.json()
  console.log('data:', data)

  const assistantMessage = data?.choices?.[0]?.message
  console.log('assistantMessage:', assistantMessage)

  // 保存第一轮 assistant 消息（里面可能有 tool_calls）
  messages.push(assistantMessage)

  const tool_calls = assistantMessage?.tool_calls
  let content = assistantMessage?.content

  console.log('tool_calls:', tool_calls)
  console.log('content:', content)

  // 如果模型调用了工具
  if (tool_calls?.length > 0) {
    for (const tool_call of tool_calls) {
      if (tool_call.function.name === 'getWeather') {
        const args = JSON.parse(tool_call.function?.arguments || '{}')
        const toolResult = await getWeather({
          city: args.city,
          date: args.date,
        })
        console.log('toolResult:', toolResult)

        // 工具消息必须紧跟在 assistant 消息之后
        messages.push({
          role: 'tool',
          tool_call_id: tool_call.id,
          content: toolResult,
        })
      }
    }

    // 第二次请求 LLM，拿到最终回复
    const secondResponse = await fetchChat(messages, tools)
    const secondData = await secondResponse.json()

    const secondMessage = secondData?.choices?.[0]?.message
    console.log('secondMessage:', secondMessage)

    content = secondMessage?.content

    // 保存最终的 assistant 回复
    messages.push(secondMessage)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.send(content)
}

async function fetchChat(messages, tools) {
  return fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      tools,
      stream: false,
    }),
  })
}
