import express from 'express'
import ollama from 'ollama'

const app = express()

app.use(express.urlencoded())

app.get('/api/generate', async (req, res) => {
  const message = req.query.message

  const response = await ollama.generate({
    model: 'llama3.2:latest',
    prompt: `你是一个中文智能助手，请使用中文回答用户的问题。
    问题：${message}`,
    stream: true,
  })

  res.setHeader('Content-Type', 'text/event-stream')

  try {
    for await (const chunk of response) {
      if (chunk.done) {
        res.end()
      } else {
        res.write(chunk.response)
      }
    }
  } catch (error) {
    if (err.name === 'AbortError') {
      console.log('流被中止了')
    } else {
      console.error(err)
    }
  }
})

app.listen(3000, () => {
  console.log('server start up success !!!')
})
