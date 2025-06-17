export interface Task {
  status: any
  id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate: Date | null
  reminderDate: Date | null
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  taskId: string
  title: string
  body: string
  date: Date
  triggered: boolean
}

