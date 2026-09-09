"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, PenLine } from "lucide-react"

type Message = {
  name: string
  content: string
  date: string
}

export default function ReaderComments() {
  const [messages, setMessages] = useState<Message[]>([])
  const [name, setName] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    const trimmedName = name.trim() || "匿名访客"
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    setMessages((prev) => [
      {
        name: trimmedName,
        content: trimmedContent,
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setName("")
    setContent("")
  }

  return (
    <section id="comments" className="py-20 bg-white dark:bg-jungle-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4 flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6 text-jungle-500 dark:text-jungle-400" />
            到此一游
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            你，你可有何话说？
          </p>
          <div className="h-1 w-20 bg-jungle-500 mx-auto mt-4"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card className="border-stone-200 dark:border-jungle-800 bg-white dark:bg-jungle-900/30">
            <CardHeader className="pb-2">
              <p className="font-medium text-stone-800 dark:text-white flex items-center gap-2">
                <PenLine className="h-5 w-5 text-jungle-600 dark:text-jungle-400" />
                留下你的足迹
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">昵称（选填）</Label>
                <Input
                  id="guest-name"
                  placeholder="怎么称呼你？"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-message">留言内容</Label>
                <Textarea
                  id="guest-message"
                  placeholder="写点什么吧…"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={200}
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="bg-jungle-600 hover:bg-jungle-700 text-white"
              >
                提交留言
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {messages.length === 0 ? (
          <p className="text-center text-stone-500 dark:text-stone-400">
            还没有人留言，快来抢沙发！
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.date}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-stone-200 dark:border-jungle-800 bg-white dark:bg-jungle-900/30 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-honey-100 text-honey-800 dark:bg-honey-900/60 dark:text-honey-200">
                          {message.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-stone-800 dark:text-white">{message.name}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-stone-600 dark:text-stone-300">{message.content}</p>
                  </CardContent>
                  <CardFooter>
                    <span className="text-sm text-stone-600 dark:text-stone-400">{message.date}</span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
