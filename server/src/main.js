import express from 'express'
import ollama from 'ollama'

const app = express()

app.use(express.urlencoded())

app.get('/api/generate', async (req, res) => {
  const message = req.query.message

  console.log('message:', message)

  const response = await ollama.generate({
    model: 'llama3.2:latest',
    prompt: `你是一个中文智能助手，请使用中文回答用户的问题。
    问题：${message}`,
  })

  console.log('response:', response)

  res.send(response.response)
})

app.listen(3000, () => {
  console.log('server start up success !!!')
})
