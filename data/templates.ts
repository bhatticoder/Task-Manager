export type Template = {
  name: string;
  description: string;
  tasks: {
    title: string;
    dueDate?: string;
    priority?: string;
    status?: string;
  }[];
};

export const templates: Template[] = [
  { 
    name: "Project Management", 
    description: "Manage your projects efficiently.",
    tasks: [
      { title: "Define project goals", priority: "High", status: "Pending" },
      { title: "Create project plan", priority: "Medium", status: "In Progress" },
      { title: "Assign team members", priority: "Low", status: "Completed" },
      { title: "Set deadlines", priority: "High", status: "Pending" },
      { title: "Monitor progress", priority: "Medium", status: "In Progress" },
      { title: "Review project outcomes", priority: "Low", status: "Completed" }, 
      { title: "Gather feedback", priority: "High", status: "Pending" },
      { title: "Finalize project report", priority: "Medium", status: "In Progress" },
      { title: "Celebrate success", priority: "Low", status: "Completed" },
    ],
  },
  { 
    name: "Kanban View", 
    description: "Visualize tasks in columns.",
    tasks: [
      { title: "To Do", status: "Pending" },
      { title: "In Progress", status: "In Progress" },
      { title: "Done", status: "Completed" },
      { title: "Backlog", status: "Pending" },
      { title: "Review", status: "In Progress" },
      { title: "Testing", status: "Completed" },
      { title: "Deployment", status: "Pending" },
      { title: "Feedback", status: "In Progress" },
      { title: "Archive", status: "Completed" },
    ]
  },
  { 
    name: "Event Planning", 
    description: "Organize events and tasks.",
    tasks: [
      { title: "Create guest list", status: "Pending" },
      { title: "Book venue", status: "In Progress" },
      { title: "Send invitations", status: "Completed" },
      { title: "Arrange catering", status: "Pending" },
      { title: "Plan entertainment", status: "In Progress" },
      { title: "Decorations", status: "Completed" },
      { title: "Audio/Visual setup", status: "Pending" },
      { title: "Finalize schedule", status: "In Progress" },
      { title: "Post-event follow-up", status: "Completed" },
    ]
  },
  { 
    name: "School", 
    description: "Track assignments and deadlines.",
    tasks: [
      { title: "Math homework", priority: "High", status: "Pending" },
      { title: "Science project", priority: "Medium", status: "In Progress" },
      { title: "History essay", priority: "Low", status: "Completed" },
      { title: "English reading", priority: "High", status: "Pending" },
      { title: "Art assignment", priority: "Medium", status: "In Progress" },
      { title: "Physical Education", priority: "Low", status: "Completed" },
      { title: "Music practice", priority: "High", status: "Pending" },
      { title: "Group study session", priority: "Medium", status: "In Progress" },
      { title: "Exam preparation", priority: "Low", status: "Completed" },
    ]
  },
  { 
    name: "Vacation", 
    description: "Plan your trips and activities.",
    tasks: [
      { title: "Book flights", status: "Pending" },
      { title: "Reserve hotel", status: "In Progress" },
      { title: "Create itinerary", status: "Completed" },
      { title: "Pack luggage", status: "Pending" },
      { title: "Arrange transportation", status: "In Progress" },
      { title: "Check weather", status: "Completed" },
      { title: "Prepare travel documents", status: "Pending" },
      { title: "Notify bank of travel plans", status: "In Progress" },
      { title: "Set out-of-office message", status: "Completed" },  
    ]
  },
  { 
    name: "Grocery", 
    description: "Manage your shopping lists.",
    tasks: [
      { title: "Buy milk", status: "Pending" },
      { title: "Eggs", status: "In Progress" },
      { title: "Bread", status: "Completed" },
      { title: "Fruits", status: "Pending" },
      { title: "Vegetables", status: "In Progress" },
      { title: "Snacks", status: "Completed" },
      { title: "Drinks", status: "Pending" },
      { title: "Household items", status: "In Progress" },
      { title: "Personal care", status: "Completed" },]
  },
];