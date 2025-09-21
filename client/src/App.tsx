import { Bubble, Sender, Welcome } from '@ant-design/x'
import { UserOutlined } from '@ant-design/icons'
import { Card, Flex } from 'antd'
import styles from './App.module.css'
import { useState } from 'react'

const fooAvatar: React.CSSProperties = {
  color: '#f56a00',
  backgroundColor: '#fde3cf',
}

const barAvatar: React.CSSProperties = {
  color: '#fff',
  backgroundColor: '#87d068',
}

type Message = {
  placement: 'start' | 'end'
  content: string
  loading: boolean
}

function App() {
  const [messageList, setMessageList] = useState<Message[]>([])

  const [value, setValue] = useState('')

  return (
    <Flex vertical gap={12} className={styles['container']}>
      <Card className={styles['message-container']}>
        <Flex vertical gap={8}>
          <Welcome
            variant="borderless"
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            title="你好，请开始跟我聊天吧"
            description="我是专门为中文用户设计的，能够帮助您解决日常生活中的问题和任务"
          />
          {messageList.map((message, index) => (
            <Bubble
              key={index}
              placement={message.placement}
              loading={message.loading}
              content={message.content}
              avatar={{
                icon: <UserOutlined />,
                style: message.placement === 'start' ? fooAvatar : barAvatar,
              }}
            />
          ))}
        </Flex>
      </Card>
      <Sender
        value={value}
        onChange={(value) => {
          setValue(value)
        }}
        onSubmit={(message) => {
          setValue('')
          setMessageList((prev) => [
            ...prev,
            {
              placement: 'end',
              content: message,
              loading: false,
            },
            {
              placement: 'start',
              content: '',
              loading: true,
            },
          ])

          fetch(`/api/generate?message=${encodeURIComponent(message)}`)
            .then((res) => res.text())
            .then((data) => {
              setMessageList((prev) =>
                prev.map((item, index) =>
                  index === prev.length - 1
                    ? {
                        ...item,
                        content: data,
                        loading: false,
                      }
                    : item
                )
              )
              console.log('data:', data)
            })
        }}
        onCancel={(...args) => {
          console.log('args', args)
        }}
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    </Flex>
  )
}

export default App
