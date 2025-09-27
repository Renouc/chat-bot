import express from 'express'
import ollama from 'ollama'

const app = express()

// 保存会话历史
const messages = [
  {
    role: 'system',
    content:
      '你是一个中文智能助手，请使用中文回答用户的问题。你的回答较为幽默诙谐，知识专业的同时，夹杂一些emoji表情。',
  },
]

app.use(express.urlencoded())

app.get('/api/chat', async (req, res) => {
  const message = req.query.message

  // 1. 把用户消息加到历史
  messages.push({ role: 'user', content: message })

  // 2. 设置响应为 SSE（流式）
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    // 3. 调用 ollama.chat，传入完整的历史
    const response = await ollama.chat({
      model: 'llama3.2:latest',
      messages,
      stream: true,
    })

    let fullResponse = ''

    // 4. 逐块写入流
    for await (const chunk of response) {
      console.log('chunk:', chunk)

      if (chunk.message?.content) {
        res.write(chunk.message.content)
        fullResponse += chunk.message.content
      }
    }

    // 5. 将 AI 的回复加回历史
    messages.push({ role: 'assistant', content: fullResponse })

    // 6. 结束流
    res.end()
  } catch (err) {
    console.error(err)
    res.end('出错了')
  }
})

app.listen(3000, () => {
  console.log('server start up success !!!')
})
